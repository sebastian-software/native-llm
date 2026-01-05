#!/usr/bin/env tsx
/**
 * Benchmark script for comparing model performance
 *
 * Tests models with three tasks of increasing complexity:
 * 1. Simple: Quick factual answer
 * 2. Medium: Concept explanation
 * 3. Complex: Code generation
 *
 * Usage: pnpm tsx scripts/benchmark.ts [model-ids...]
 * Example: pnpm tsx scripts/benchmark.ts gemma-3n-e4b qwen3-8b phi-4
 *
 * Run all recommended models:
 * pnpm tsx scripts/benchmark.ts --all
 */

import { LLMEngine, MODELS, type ModelId } from "../src/index.js"

// ============================================
// Benchmark Tasks
// ============================================

interface BenchmarkTask {
  name: string
  complexity: "simple" | "medium" | "complex"
  prompt: string
  systemPrompt?: string
  maxTokens: number
  description: string
}

const TASKS: BenchmarkTask[] = [
  {
    name: "Quick Math",
    complexity: "simple",
    prompt: "What is 17 * 24? Reply with just the number.",
    maxTokens: 20,
    description: "Simple arithmetic, minimal output"
  },
  {
    name: "Concept Explanation",
    complexity: "medium",
    prompt: "Explain how a hash table works in 2-3 sentences. Be concise but accurate.",
    maxTokens: 100,
    description: "Technical explanation, moderate output"
  },
  {
    name: "Code Generation",
    complexity: "complex",
    prompt: `Write a TypeScript function that implements binary search on a sorted array. Include JSDoc comments.`,
    systemPrompt: "You are an expert TypeScript developer. Write clean, typed code.",
    maxTokens: 300,
    description: "Code generation with documentation"
  }
]

// Models to benchmark by default (good variety of sizes)
const DEFAULT_MODELS: ModelId[] = [
  "gemma-3n-e2b", // ~2GB - Edge
  "gemma-3n-e4b", // ~3GB - Balanced
  "deepseek-r1-7b", // ~5GB - Reasoning
  "phi-4", // ~9GB - STEM
  "qwen-2.5-coder-7b" // ~5GB - Code optimized
]

// Full benchmark includes larger models
const ALL_MODELS: ModelId[] = [
  ...DEFAULT_MODELS,
  "deepseek-r1-14b", // ~9GB - Best reasoning
  "minimax-m2.1", // ~12GB - Coding champion
  "gemma-3-27b" // ~18GB - Maximum quality
  // Note: qwen3-* and gpt-oss excluded due to chat template issues
]

// ============================================
// Benchmark Runner
// ============================================

interface TaskResult {
  task: string
  complexity: string
  tokensGenerated: number
  tokensPerSecond: number
  durationMs: number
  success: boolean
}

interface ModelResult {
  modelId: string
  modelName: string
  parameters: string
  loadTimeMs: number
  tasks: TaskResult[]
  avgTokensPerSecond: number
  totalDurationMs: number
}

async function benchmarkModel(modelId: ModelId): Promise<ModelResult | null> {
  const modelInfo = MODELS[modelId]
  console.log(`\n${"=".repeat(60)}`)
  console.log(`🧪 ${modelInfo.name} (${modelInfo.parameters})`)
  console.log(`   ${modelInfo.description}`)
  console.log("=".repeat(60))

  const engine = new LLMEngine({
    model: modelId,
    gpuLayers: -1 // Full GPU acceleration
  })

  // Load model
  console.log("\n⏳ Loading model...")
  const loadStart = performance.now()
  try {
    await engine.initialize()
  } catch (error) {
    console.log(`❌ Failed to load: ${error}`)
    return null
  }
  const loadTimeMs = performance.now() - loadStart
  console.log(`✅ Loaded in ${(loadTimeMs / 1000).toFixed(1)}s`)

  const taskResults: TaskResult[] = []
  let totalTokens = 0
  let totalTime = 0

  // Run each task
  for (const task of TASKS) {
    console.log(`\n📝 Task: ${task.name} [${task.complexity}]`)
    console.log(`   ${task.description}`)

    const start = performance.now()
    try {
      const result = await engine.generate({
        prompt: task.prompt,
        systemPrompt: task.systemPrompt,
        maxTokens: task.maxTokens,
        temperature: 0.3 // Lower for more consistent benchmarks
      })

      const durationMs = performance.now() - start
      totalTokens += result.tokenCount
      totalTime += durationMs

      taskResults.push({
        task: task.name,
        complexity: task.complexity,
        tokensGenerated: result.tokenCount,
        tokensPerSecond: result.tokensPerSecond,
        durationMs,
        success: true
      })

      // Show preview of response
      const preview = result.text.trim().slice(0, 80) + (result.text.length > 80 ? "..." : "")
      console.log(`   Response: "${preview}"`)
      console.log(
        `   ⚡ ${result.tokensPerSecond.toFixed(1)} tok/s | ${result.tokenCount} tokens | ${(durationMs / 1000).toFixed(2)}s`
      )
    } catch (error) {
      console.log(`   ❌ Failed: ${error}`)
      taskResults.push({
        task: task.name,
        complexity: task.complexity,
        tokensGenerated: 0,
        tokensPerSecond: 0,
        durationMs: 0,
        success: false
      })
    }
  }

  await engine.dispose()

  const avgTokensPerSecond = totalTime > 0 ? (totalTokens / totalTime) * 1000 : 0

  return {
    modelId,
    modelName: modelInfo.name,
    parameters: modelInfo.parameters,
    loadTimeMs,
    tasks: taskResults,
    avgTokensPerSecond,
    totalDurationMs: totalTime + loadTimeMs
  }
}

// ============================================
// Results Formatting
// ============================================

function formatResultsTable(results: ModelResult[]): string {
  const lines: string[] = []

  lines.push("\n## Performance Results\n")
  lines.push("| Model | Params | Load | Simple | Medium | Complex | Avg tok/s |")
  lines.push("|-------|--------|------|--------|--------|---------|-----------|")

  for (const r of results) {
    const simple = r.tasks.find((t) => t.complexity === "simple")
    const medium = r.tasks.find((t) => t.complexity === "medium")
    const complex = r.tasks.find((t) => t.complexity === "complex")

    const formatSpeed = (task?: TaskResult) =>
      task?.success ? `${task.tokensPerSecond.toFixed(0)} tok/s` : "❌"

    lines.push(
      `| **${r.modelName}** | ${r.parameters} | ${(r.loadTimeMs / 1000).toFixed(1)}s | ${formatSpeed(simple)} | ${formatSpeed(medium)} | ${formatSpeed(complex)} | **${r.avgTokensPerSecond.toFixed(0)}** |`
    )
  }

  return lines.join("\n")
}

function formatDetailedResults(results: ModelResult[]): string {
  const lines: string[] = []

  lines.push("\n## Detailed Results\n")

  for (const r of results) {
    lines.push(`### ${r.modelName} (${r.parameters})`)
    lines.push(`- **Load time**: ${(r.loadTimeMs / 1000).toFixed(1)}s`)
    lines.push(`- **Average speed**: ${r.avgTokensPerSecond.toFixed(1)} tokens/second`)
    lines.push("")

    for (const task of r.tasks) {
      if (task.success) {
        lines.push(
          `- ${task.task}: ${task.tokensPerSecond.toFixed(1)} tok/s (${task.tokensGenerated} tokens in ${(task.durationMs / 1000).toFixed(2)}s)`
        )
      } else {
        lines.push(`- ${task.task}: ❌ Failed`)
      }
    }
    lines.push("")
  }

  return lines.join("\n")
}

// ============================================
// Main
// ============================================

async function main() {
  console.log("🏎️  native-llm Benchmark Suite")
  console.log("================================\n")

  // Parse arguments
  let modelsToTest: ModelId[]

  if (process.argv.includes("--all")) {
    modelsToTest = ALL_MODELS
    console.log("Testing ALL models (this will take a while)...")
  } else if (process.argv.length > 2) {
    modelsToTest = process.argv.slice(2).filter((arg) => !arg.startsWith("--")) as ModelId[]
    // Validate models
    for (const id of modelsToTest) {
      if (!(id in MODELS)) {
        console.error(`❌ Unknown model: ${id}`)
        console.log(`Available: ${Object.keys(MODELS).join(", ")}`)
        process.exit(1)
      }
    }
  } else {
    modelsToTest = DEFAULT_MODELS
    console.log("Testing default models. Use --all for full benchmark.")
  }

  console.log(`\nModels: ${modelsToTest.join(", ")}`)
  console.log(`Tasks: ${TASKS.map((t) => t.name).join(", ")}`)

  // Get system info
  console.log(`\n📊 System: ${process.platform} ${process.arch}`)
  console.log(`   Node.js: ${process.version}`)

  const results: ModelResult[] = []

  for (const modelId of modelsToTest) {
    const result = await benchmarkModel(modelId)
    if (result) {
      results.push(result)
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 BENCHMARK SUMMARY")
  console.log("=".repeat(60))

  console.log(formatResultsTable(results))
  console.log(formatDetailedResults(results))

  // Print for README
  console.log("\n" + "=".repeat(60))
  console.log("📋 README TABLE (copy this):")
  console.log("=".repeat(60))
  console.log(formatResultsTable(results))
}

main().catch(console.error)
