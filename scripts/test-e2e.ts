#!/usr/bin/env tsx
/**
 * End-to-end test for llm-native
 */

import { LLMEngine, MODELS } from "../src/index.js"

async function main() {
  console.log("=== LLM-Native E2E Test ===\n")

  // Parse command line arguments
  const args = process.argv.slice(2)
  const modelName = args[0] || "qwen-2.5-1.5b"
  const prompt = args[1] || "What is 2+2? Answer in one sentence."

  console.log(`Model: ${modelName}`)
  console.log(`Prompt: ${prompt}\n`)

  // Check if model exists in registry
  if (modelName in MODELS) {
    const info = MODELS[modelName as keyof typeof MODELS]
    console.log("Model Info:")
    console.log(`  Name: ${info.name}`)
    console.log(`  Parameters: ${info.parameters}`)
    console.log(`  Quantization: ${info.quantization}`)
    console.log(`  Context: ${info.contextLength}`)
    console.log(`  Repo: ${info.repo}\n`)
  }

  // Create engine
  const engine = new LLMEngine({
    model: modelName,
    gpuLayers: -1 // All layers on GPU
  })

  try {
    // Initialize (downloads model if needed)
    console.log("Initializing engine...")
    const initStart = Date.now()
    await engine.initialize()
    const initTime = (Date.now() - initStart) / 1000
    console.log(`Engine initialized in ${initTime.toFixed(2)}s\n`)

    // Generate with streaming
    console.log("Generating response (streaming):")
    console.log("---")

    const result = await engine.generateStreaming(
      {
        prompt,
        maxTokens: 100,
        temperature: 0.7
      },
      (token) => {
        process.stdout.write(token)
      }
    )

    console.log("\n---\n")

    // Stats
    console.log("Stats:")
    console.log(`  Tokens: ${result.tokenCount}`)
    console.log(`  Speed: ${result.tokensPerSecond.toFixed(1)} tokens/sec`)
    console.log(`  Time: ${result.durationSeconds.toFixed(2)}s`)
    console.log(`  Finish: ${result.finishReason}`)

    // Test chat API
    console.log("\n--- Chat API Test ---")

    await engine.resetSession()

    const chatResult = await engine.chat(
      [
        { role: "system", content: "You are a helpful assistant. Be concise." },
        { role: "user", content: "What is the capital of France?" }
      ],
      {
        maxTokens: 50
      }
    )

    console.log(`Response: ${chatResult.text}`)
    console.log(`Speed: ${chatResult.tokensPerSecond.toFixed(1)} tokens/sec`)

    // Cleanup
    await engine.dispose()
    console.log("\nDone!")
  } catch (error) {
    console.error("Error:", error)
    await engine.dispose()
    process.exit(1)
  }
}

main()
