/**
 * Type definitions for llm-native
 *
 * Uses node-llama-cpp with GGUF models for efficient local inference.
 */

/**
 * Available GGUF models from HuggingFace
 *
 * All models use GGUF format optimized for llama.cpp inference.
 * Q4_K_M quantization offers best quality/size tradeoff.
 *
 * Auth: Models marked with `requiresAuth: true` need HF_TOKEN environment variable.
 *
 * Quantization guide:
 * - Q8_0: Highest quality, ~1 byte/param
 * - Q6_K: Very high quality, ~0.75 byte/param
 * - Q5_K_M: High quality, ~0.6 byte/param
 * - Q4_K_M: Good quality, ~0.5 byte/param (recommended)
 * - Q3_K_M: Lower quality, ~0.4 byte/param
 */
export const MODELS = {
  // ============================================
  // Gemma 3n - Nano/Edge optimized (requires HF_TOKEN)
  // Matryoshka architecture: more params compressed to less RAM
  // ============================================
  "gemma-3n-e2b": {
    name: "Gemma 3n E2B",
    repo: "unsloth/gemma-3n-E2B-it-GGUF",
    file: "gemma-3n-E2B-it-Q4_K_M.gguf",
    parameters: "5B→2B",
    quantization: "Q4_K_M",
    contextLength: 32768,
    languages: ["en", "de", "fr", "es", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh"],
    description: "Ultra-efficient edge model, ~2GB RAM",
    requiresAuth: false,
    benchmarks: { mmlu: 64, arena: 1250 }
  },
  "gemma-3n-e4b": {
    name: "Gemma 3n E4B",
    repo: "unsloth/gemma-3n-E4B-it-GGUF",
    file: "gemma-3n-E4B-it-Q4_K_M.gguf",
    parameters: "8B→4B",
    quantization: "Q4_K_M",
    contextLength: 32768,
    languages: ["en", "de", "fr", "es", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh"],
    description: "Best edge model, ~3GB RAM",
    requiresAuth: false,
    benchmarks: { mmlu: 75, arena: 1300 }
  },

  // ============================================
  // Gemma 3 27B - Maximum quality when RAM allows
  // Use when 3n's 32K context isn't enough (has 128K)
  // ============================================
  "gemma-3-27b": {
    name: "Gemma 3 27B",
    repo: "unsloth/gemma-3-27b-it-GGUF",
    file: "gemma-3-27b-it-Q4_K_M.gguf",
    parameters: "27B",
    quantization: "Q4_K_M",
    contextLength: 131072,
    languages: ["en", "de", "fr", "es", "it", "pt", "nl", "pl", "ru", "ja", "ko", "zh"],
    description: "Maximum quality, 128K context, ~18GB RAM",
    benchmarks: { mmlu: 77, arena: 1338 }
  },

  // ============================================
  // GPT-OSS 20B - OpenAI's open-weight model (Apache 2.0)
  // MoE architecture: 21B total, only 3.6B active = efficient
  // ============================================
  "gpt-oss-20b": {
    name: "GPT-OSS 20B",
    repo: "unsloth/gpt-oss-20b-GGUF",
    file: "gpt-oss-20b-Q4_K_M.gguf",
    parameters: "21B (3.6B active)",
    quantization: "Q4_K_M",
    contextLength: 131072,
    languages: ["en"],
    description: "OpenAI's open model, MoE, ~16GB RAM",
    benchmarks: { mmlu: 82, arena: 1340 }
  },

  // ============================================
  // Phi-4 - Microsoft's reasoning models
  // ============================================
  "phi-4": {
    name: "Phi-4 14B",
    repo: "bartowski/phi-4-GGUF",
    file: "phi-4-Q4_K_M.gguf",
    parameters: "14B",
    quantization: "Q4_K_M",
    contextLength: 16384,
    languages: ["en"],
    description: "Microsoft's reasoning-focused, excellent for STEM",
    benchmarks: { mmlu: 84, arena: 1320 }
  },

  // ============================================
  // Qwen3 - Latest generation with thinking mode
  // Use enableThinking: true to see chain-of-thought reasoning
  // ============================================
  "qwen3-4b": {
    name: "Qwen3 4B",
    repo: "unsloth/Qwen3-4B-GGUF",
    file: "Qwen3-4B-Q4_K_M.gguf",
    parameters: "4B",
    quantization: "Q4_K_M",
    contextLength: 32768,
    languages: ["en", "zh", "de", "fr", "es", "pt", "it", "nl", "pl", "ru", "ja", "ko"],
    description: "Thinking mode, 100+ languages, ~3GB RAM",
    thinkingMode: "qwen", // Supports /no_think prefix
    benchmarks: { mmlu: 76, arena: 1300 }
  },
  "qwen3-8b": {
    name: "Qwen3 8B",
    repo: "unsloth/Qwen3-8B-GGUF",
    file: "Qwen3-8B-Q4_K_M.gguf",
    parameters: "8B",
    quantization: "Q4_K_M",
    contextLength: 32768,
    languages: ["en", "zh", "de", "fr", "es", "pt", "it", "nl", "pl", "ru", "ja", "ko"],
    description: "Thinking mode, excellent multilingual, ~5GB RAM",
    thinkingMode: "qwen",
    benchmarks: { mmlu: 81, arena: 1350 }
  },
  "qwen3-14b": {
    name: "Qwen3 14B",
    repo: "unsloth/Qwen3-14B-GGUF",
    file: "Qwen3-14B-Q4_K_M.gguf",
    parameters: "14B",
    quantization: "Q4_K_M",
    contextLength: 32768,
    languages: ["en", "zh", "de", "fr", "es", "pt", "it", "nl", "pl", "ru", "ja", "ko"],
    description: "Thinking mode, top multilingual, ~9GB RAM",
    thinkingMode: "qwen",
    benchmarks: { mmlu: 84, arena: 1380 }
  },
  "qwen-2.5-coder-7b": {
    name: "Qwen 2.5 Coder 7B",
    repo: "bartowski/Qwen2.5-Coder-7B-Instruct-GGUF",
    file: "Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf",
    parameters: "7B",
    quantization: "Q4_K_M",
    contextLength: 131072,
    languages: ["en"],
    description: "Optimized for code generation",
    benchmarks: { mmlu: 66, arena: 1250 }
  },

  // ============================================
  // DeepSeek R1 - Reasoning specialists (chain-of-thought)
  // These models always think before answering - needs more tokens
  // ============================================
  "deepseek-r1-7b": {
    name: "DeepSeek R1 Distill 7B",
    repo: "bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF",
    file: "DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf",
    parameters: "7B",
    quantization: "Q4_K_M",
    contextLength: 131072,
    languages: ["en", "zh"],
    description: "Strong reasoning with chain-of-thought",
    thinkingMode: "deepseek", // Always thinks, needs more tokens
    benchmarks: { mmlu: 72, arena: 1300 }
  },
  "deepseek-r1-14b": {
    name: "DeepSeek R1 Distill 14B",
    repo: "bartowski/DeepSeek-R1-Distill-Qwen-14B-GGUF",
    file: "DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf",
    parameters: "14B",
    quantization: "Q4_K_M",
    contextLength: 131072,
    languages: ["en", "zh"],
    description: "Best reasoning model, shows thinking",
    thinkingMode: "deepseek",
    benchmarks: { mmlu: 79, arena: 1350 }
  }
} as const

export type ModelId = keyof typeof MODELS
export type ModelInfo = (typeof MODELS)[ModelId]

/**
 * Short model name aliases for convenience
 */
export const MODEL_ALIASES: Record<string, ModelId> = {
  // Gemma
  gemma: "gemma-3n-e4b",
  "gemma-large": "gemma-3-27b",

  // GPT-OSS (experimental)
  "gpt-oss": "gpt-oss-20b",

  // Phi
  phi: "phi-4",

  // Qwen3
  qwen: "qwen3-8b",
  qwen3: "qwen3-8b",
  "qwen-coder": "qwen-2.5-coder-7b",

  // DeepSeek
  deepseek: "deepseek-r1-7b"
}

/**
 * Model recommendations by use case
 */
export const RECOMMENDED_MODELS = {
  /** Fast responses, simple tasks (~2GB RAM) */
  fast: "gemma-3n-e2b",
  /** Best quality/speed balance (~3GB RAM) */
  balanced: "gemma-3n-e4b",
  /** Maximum quality (~18GB RAM) */
  quality: "gemma-3-27b",
  /** Best for edge/mobile - minimal RAM */
  edge: "gemma-3n-e2b",
  /** Best multilingual */
  multilingual: "qwen3-8b",
  /** Complex reasoning (chain-of-thought) */
  reasoning: "deepseek-r1-14b",
  /** Code generation */
  code: "qwen-2.5-coder-7b",
  /** Long documents (128K context) */
  longContext: "gemma-3-27b"
} as const

/**
 * Options for engine initialization
 */
export interface EngineOptions {
  /** Model to use (model ID, alias, or path to .gguf file) */
  model: string

  /** GPU layers to offload (-1 = all, 0 = CPU only) */
  gpuLayers?: number

  /** Context size override */
  contextSize?: number

  /**
   * HuggingFace access token for gated models (like Gemma 3)
   * Can also be set via HF_TOKEN environment variable
   */
  huggingFaceToken?: string

  /**
   * Enable thinking/reasoning mode for models that support it (Qwen3, DeepSeek R1)
   * - When false (default): Disables thinking for faster responses
   * - When true: Shows chain-of-thought reasoning (slower but more detailed)
   */
  enableThinking?: boolean
}

/**
 * Options for text generation
 */
export interface GenerateOptions {
  /** The prompt to generate from */
  prompt: string

  /** System prompt (optional) */
  systemPrompt?: string

  /** Maximum tokens to generate */
  maxTokens?: number

  /** Temperature for sampling (0.0 - 2.0) */
  temperature?: number

  /** Top-p sampling */
  topP?: number

  /** Top-k sampling */
  topK?: number

  /** Repetition penalty */
  repeatPenalty?: number

  /** Stop sequences */
  stop?: string[]
}

/**
 * Result of text generation
 */
export interface GenerateResult {
  /** Generated text */
  text: string

  /** Number of tokens generated */
  tokenCount: number

  /** Prompt token count */
  promptTokenCount: number

  /** Time taken in seconds */
  durationSeconds: number

  /** Tokens per second */
  tokensPerSecond: number

  /** Finish reason: 'stop', 'length', 'error' */
  finishReason: "stop" | "length" | "error"

  /** Model used */
  model: string
}

/**
 * Streaming token callback
 */
export type TokenCallback = (token: string) => void
