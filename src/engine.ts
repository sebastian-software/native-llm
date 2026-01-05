/**
 * LLMEngine - Native LLM inference via llama.cpp
 *
 * Uses node-llama-cpp for efficient local inference with Metal GPU acceleration.
 */

import {
  getLlama,
  LlamaModel,
  LlamaContext,
  LlamaChatSession,
  resolveModelFile,
  type Llama,
  type ModelFileAccessTokens
} from "node-llama-cpp"

import {
  MODELS,
  MODEL_ALIASES,
  type EngineOptions,
  type GenerateOptions,
  type GenerateResult,
  type ModelId,
  type TokenCallback
} from "./types.js"

/**
 * Native LLM Engine
 *
 * Provides text generation using llama.cpp with Metal GPU acceleration.
 */
export class LLMEngine {
  private readonly modelId: string
  private readonly gpuLayers: number
  private readonly contextSize?: number
  private readonly hfToken?: string
  private readonly enableThinking: boolean

  private llama: Llama | null = null
  private model: LlamaModel | null = null
  private context: LlamaContext | null = null
  private session: LlamaChatSession | null = null

  constructor(options: EngineOptions) {
    // Resolve model alias if needed
    const modelKey = options.model.toLowerCase()
    if (modelKey in MODEL_ALIASES) {
      this.modelId = MODEL_ALIASES[modelKey]
    } else if (modelKey in MODELS) {
      this.modelId = modelKey as ModelId
    } else {
      // Assume it's a path to a .gguf file
      this.modelId = options.model
    }

    this.gpuLayers = options.gpuLayers ?? -1 // -1 = all layers on GPU
    this.contextSize = options.contextSize
    this.enableThinking = options.enableThinking ?? false
    // Use provided token or fall back to environment variable
    this.hfToken = options.huggingFaceToken ?? process.env.HF_TOKEN
  }

  /**
   * Check if we're running on a supported platform
   */
  isAvailable(): boolean {
    return true // llama.cpp supports macOS, Linux, Windows
  }

  /**
   * Get the HuggingFace URI for a model
   */
  private getModelUri(): string {
    if (this.modelId in MODELS) {
      const info = MODELS[this.modelId as ModelId]
      return `hf:${info.repo}/${info.file}`
    }
    // Assume it's already a path or URL
    return this.modelId
  }

  /**
   * Get the thinking mode for the current model
   */
  private getThinkingMode(): "qwen" | "deepseek" | undefined {
    if (this.modelId in MODELS) {
      const info = MODELS[this.modelId as ModelId]
      return (info as { thinkingMode?: "qwen" | "deepseek" }).thinkingMode
    }
    return undefined
  }

  /**
   * Prepare prompt for thinking-mode models
   * - Qwen3: Add /no_think prefix when thinking is disabled
   * - DeepSeek: No modification needed (always thinks)
   */
  private preparePrompt(prompt: string): string {
    const thinkingMode = this.getThinkingMode()

    if (thinkingMode === "qwen" && !this.enableThinking) {
      // Disable thinking mode for Qwen3 by adding /no_think prefix
      return `/no_think ${prompt}`
    }

    return prompt
  }

  /**
   * Get appropriate max tokens for the model
   * DeepSeek models need more tokens because they think first
   */
  private getDefaultMaxTokens(): number {
    const thinkingMode = this.getThinkingMode()

    if (thinkingMode === "deepseek") {
      // DeepSeek needs more tokens for thinking + response
      return 512
    }

    return 256
  }

  /**
   * Initialize the engine and load the model
   *
   * Downloads the model from HuggingFace if not cached locally.
   * Uses Metal GPU acceleration on Apple Silicon.
   *
   * @throws Error if model download or loading fails
   *
   * @example
   * ```typescript
   * const engine = new LLMEngine({ model: "gemma-3n-e4b" })
   * await engine.initialize()
   * ```
   */
  async initialize(): Promise<void> {
    if (this.model) {
      return // Already initialized
    }

    // Get llama instance
    this.llama = await getLlama()

    // Resolve model file (downloads if needed)
    const modelUri = this.getModelUri()
    console.log(`Resolving model: ${modelUri}`)

    // Build tokens object if HuggingFace token is available
    const tokens: ModelFileAccessTokens | undefined = this.hfToken
      ? { huggingFace: this.hfToken }
      : undefined

    const modelPath = await resolveModelFile(modelUri, { tokens })
    console.log(`Loading model from: ${modelPath}`)

    this.model = await this.llama.loadModel({
      modelPath,
      gpuLayers: this.gpuLayers
    })

    // Create context
    const contextOptions: { model: LlamaModel; contextSize?: number } = {
      model: this.model
    }
    if (this.contextSize) {
      contextOptions.contextSize = this.contextSize
    }

    this.context = await this.model.createContext(contextOptions)

    // Create chat session
    this.session = new LlamaChatSession({
      contextSequence: this.context.getSequence()
    })

    console.log("Model loaded successfully!")
  }

  /**
   * Generate text from a prompt
   *
   * Automatically initializes the engine if not already done.
   * For thinking-mode models (Qwen3, DeepSeek), applies appropriate settings.
   *
   * @param options - Generation options including prompt, maxTokens, temperature
   * @returns Generation result with text, token counts, and performance metrics
   *
   * @example
   * ```typescript
   * const result = await engine.generate({
   *   prompt: "Explain quantum computing",
   *   maxTokens: 200,
   *   temperature: 0.7
   * })
   * console.log(result.text)
   * console.log(`${result.tokensPerSecond.toFixed(1)} tok/s`)
   * ```
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    if (!this.session || !this.context) {
      await this.initialize()
    }

    if (!this.session || !this.context) {
      throw new Error("Failed to initialize engine")
    }

    const startTime = Date.now()
    let generatedTokens = 0

    // Prepare prompt for thinking-mode models
    const prompt = this.preparePrompt(options.prompt)
    if (options.systemPrompt) {
      // For chat session, we'll use the system prompt in the first message
      this.session.setChatHistory([{ type: "system", text: options.systemPrompt }])
    }

    // Generate response
    const response = await this.session.prompt(prompt, {
      maxTokens: options.maxTokens ?? this.getDefaultMaxTokens(),
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 0.9,
      topK: options.topK ?? 40,
      repeatPenalty: {
        penalty: options.repeatPenalty ?? 1.1
      },
      stopOnAbortSignal: true,
      onTextChunk: () => {
        generatedTokens++
      }
    })

    const durationSeconds = (Date.now() - startTime) / 1000
    const tokensPerSecond = generatedTokens / durationSeconds

    return {
      text: response,
      tokenCount: generatedTokens,
      promptTokenCount: 0, // Not easily available from session
      durationSeconds,
      tokensPerSecond,
      finishReason: "stop",
      model: this.modelId
    }
  }

  /**
   * Generate text with streaming token-by-token output
   *
   * Same as `generate()` but calls `onToken` for each generated token,
   * enabling real-time display of responses.
   *
   * @param options - Generation options including prompt, maxTokens, temperature
   * @param onToken - Callback invoked for each generated token
   * @returns Generation result with text, token counts, and performance metrics
   *
   * @example
   * ```typescript
   * const result = await engine.generateStreaming(
   *   { prompt: "Write a haiku" },
   *   (token) => process.stdout.write(token)
   * )
   * ```
   */
  async generateStreaming(
    options: GenerateOptions,
    onToken: TokenCallback
  ): Promise<GenerateResult> {
    if (!this.session || !this.context) {
      await this.initialize()
    }

    if (!this.session || !this.context) {
      throw new Error("Failed to initialize engine")
    }

    const startTime = Date.now()
    let generatedTokens = 0

    // Prepare prompt for thinking-mode models
    const prompt = this.preparePrompt(options.prompt)
    if (options.systemPrompt) {
      this.session.setChatHistory([{ type: "system", text: options.systemPrompt }])
    }

    // Generate response with streaming
    const response = await this.session.prompt(prompt, {
      maxTokens: options.maxTokens ?? this.getDefaultMaxTokens(),
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 0.9,
      topK: options.topK ?? 40,
      repeatPenalty: {
        penalty: options.repeatPenalty ?? 1.1
      },
      onTextChunk: (chunk) => {
        generatedTokens++
        onToken(chunk)
      }
    })

    const durationSeconds = (Date.now() - startTime) / 1000
    const tokensPerSecond = generatedTokens / durationSeconds

    return {
      text: response,
      tokenCount: generatedTokens,
      promptTokenCount: 0,
      durationSeconds,
      tokensPerSecond,
      finishReason: "stop",
      model: this.modelId
    }
  }

  /**
   * Generate text using chat message format
   *
   * Supports multi-turn conversations with system, user, and assistant messages.
   * Automatically manages chat history within the session.
   *
   * @param messages - Array of chat messages with role and content
   * @param options - Optional generation options (maxTokens, temperature, etc.)
   * @returns Generation result with assistant's response
   *
   * @example
   * ```typescript
   * const result = await engine.chat([
   *   { role: "system", content: "You are a helpful assistant." },
   *   { role: "user", content: "What is 2+2?" }
   * ])
   * console.log(result.text) // "4"
   * ```
   */
  async chat(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options?: Omit<GenerateOptions, "prompt" | "systemPrompt">
  ): Promise<GenerateResult> {
    if (!this.session || !this.context) {
      await this.initialize()
    }

    if (!this.session || !this.context) {
      throw new Error("Failed to initialize engine")
    }

    // Convert messages to chat history format
    const chatHistory = messages.map((msg) => {
      if (msg.role === "system") {
        return { type: "system" as const, text: msg.content }
      } else if (msg.role === "assistant") {
        return { type: "model" as const, response: [msg.content] }
      } else {
        return { type: "user" as const, text: msg.content }
      }
    })

    // Set chat history (all but last user message)
    const lastMessage = chatHistory.pop()
    if (chatHistory.length > 0) {
      this.session.setChatHistory(chatHistory)
    }

    // Generate response for last user message
    if (lastMessage?.type !== "user") {
      throw new Error("Last message must be from user")
    }

    return this.generate({
      prompt: lastMessage.text,
      ...options
    })
  }

  /**
   * Get information about the current model
   *
   * Returns model metadata including name, parameters, context length,
   * supported languages, and benchmark scores.
   *
   * @returns Model information object
   */
  getModelInfo() {
    if (this.modelId in MODELS) {
      return MODELS[this.modelId as ModelId]
    }
    return {
      name: this.modelId,
      repo: "custom",
      file: this.modelId,
      parameters: "unknown",
      quantization: "unknown",
      contextLength: 4096,
      languages: ["en"],
      description: "Custom model"
    }
  }

  /**
   * Reset the chat session
   *
   * Clears all conversation history, starting fresh for new conversations.
   * The model remains loaded; use `dispose()` to fully unload.
   */
  resetSession(): void {
    if (this.session) {
      this.session.setChatHistory([])
    }
  }

  /**
   * Clean up resources and unload the model
   *
   * Releases GPU memory and cleans up native resources.
   * Call this when done with the engine to prevent memory leaks.
   *
   * @example
   * ```typescript
   * const engine = new LLMEngine({ model: "gemma-3n-e4b" })
   * try {
   *   await engine.initialize()
   *   const result = await engine.generate({ prompt: "Hello" })
   * } finally {
   *   await engine.dispose()
   * }
   * ```
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose()
      this.context = null
    }
    if (this.model) {
      await this.model.dispose()
      this.model = null
    }
    this.session = null
    this.llama = null
  }
}
