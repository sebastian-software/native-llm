/**
 * llm-native - Native LLM inference via llama.cpp
 *
 * This package provides Node.js bindings for running LLMs locally
 * using llama.cpp with Metal GPU acceleration on Apple Silicon.
 *
 * @example
 * ```typescript
 * import { LLMEngine, MODELS } from 'llm-native'
 *
 * const engine = new LLMEngine({ model: 'gemma-2-2b' })
 * await engine.initialize()
 *
 * const result = await engine.generate({
 *   prompt: 'Explain quantum computing briefly.',
 *   maxTokens: 200
 * })
 *
 * console.log(result.text)
 * console.log(`${result.tokensPerSecond.toFixed(1)} tokens/sec`)
 *
 * await engine.dispose()
 * ```
 */

export { LLMEngine } from "./engine.js"
export { MODELS, MODEL_ALIASES, RECOMMENDED_MODELS, type ModelId, type ModelInfo } from "./types.js"
export type { GenerateOptions, GenerateResult, EngineOptions, TokenCallback } from "./types.js"
