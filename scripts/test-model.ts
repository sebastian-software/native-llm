#!/usr/bin/env tsx
/**
 * Quick test for any model
 * Usage: pnpm tsx scripts/test-model.ts [model-id]
 */

import { LLMEngine, MODELS, type ModelId } from "../src/index.js"

async function main() {
  const modelId = (process.argv[2] || "qwen-2.5-1.5b") as ModelId

  if (!(modelId in MODELS)) {
    console.log(`Unknown model: ${modelId}`)
    console.log(`Available: ${Object.keys(MODELS).join(", ")}`)
    process.exit(1)
  }

  console.log(`🧪 Testing ${modelId}...`)
  console.log(`   ${MODELS[modelId].description}\n`)

  const engine = new LLMEngine({
    model: modelId,
    gpuLayers: -1
  })

  console.log("🔄 Initializing...")
  const start = performance.now()
  await engine.initialize()
  console.log(`✅ Ready in ${((performance.now() - start) / 1000).toFixed(1)}s\n`)

  // Test generation
  console.log('📝 Prompt: "What is 2+2?"')
  const result = await engine.generate({
    prompt: "What is 2+2?",
    maxTokens: 30,
    temperature: 0.3
  })

  console.log(`\n💬 Response: "${result.text.trim()}"`)
  console.log(`📊 Tokens: ${result.tokenCount}`)
  console.log(`⚡ Speed: ${result.tokensPerSecond.toFixed(1)} tokens/sec`)

  await engine.dispose()
  console.log("\n✨ Done!")
}

main().catch(console.error)
