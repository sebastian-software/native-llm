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
   * Initialize the engine and load the model
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

    // Build the prompt
    const prompt = options.prompt
    if (options.systemPrompt) {
      // For chat session, we'll use the system prompt in the first message
      this.session.setChatHistory([{ type: "system", text: options.systemPrompt }])
    }

    // Generate response
    const response = await this.session.prompt(prompt, {
      maxTokens: options.maxTokens ?? 256,
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
   * Generate text with streaming
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

    // Build the prompt
    const prompt = options.prompt
    if (options.systemPrompt) {
      this.session.setChatHistory([{ type: "system", text: options.systemPrompt }])
    }

    // Generate response with streaming
    const response = await this.session.prompt(prompt, {
      maxTokens: options.maxTokens ?? 256,
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
   * Generate text with chat messages
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
   * Get information about the loaded model
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
   * Reset the chat session (clear history)
   */
  resetSession(): void {
    if (this.session) {
      this.session.setChatHistory([])
    }
  }

  /**
   * Clean up resources
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
