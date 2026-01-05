# native-llm

> High-performance LLM inference in Node.js

Local LLM inference using [llama.cpp](https://github.com/ggerganov/llama.cpp) with Metal GPU
acceleration on Apple Silicon, CUDA on NVIDIA, and CPU fallback everywhere else.

## Features

- **Native Performance**: Direct N-API bindings, no subprocess overhead
- **Metal GPU**: Full Apple Silicon GPU acceleration
- **Cross-Platform**: macOS, Linux, Windows support
- **Auto-Download**: Models are downloaded automatically from HuggingFace
- **GGUF Format**: Access to 1000+ quantized models
- **Streaming**: Real-time token-by-token output
- **TypeScript**: Full type definitions included

## Model Comparison

### Cloud Services (Reference)

| Model               | Provider  | Params | MMLU | GPQA | SWE | Arena |
| ------------------- | --------- | ------ | ---- | ---- | --- | ----- |
| **GPT-5.2**         | OpenAI    | ~2T    | 92%  | 89%  | 78% | ~1420 |
| **Claude 4.5 Opus** | Anthropic | ~200B  | 91%  | 88%  | 82% | ~1400 |
| **Gemini 3**        | Google    | ~300B  | 90%  | 87%  | 62% | ~1380 |
| **DeepSeek V3**     | DeepSeek  | 671B   | 88%  | 82%  | 72% | ~1350 |

### Top Local Models (Recommended)

| Model               | Params     | Context | RAM   | MMLU    | SWE     | Best For                |
| ------------------- | ---------- | ------- | ----- | ------- | ------- | ----------------------- |
| **MiniMax M2.1**    | 45B (10B)  | 128K    | ~12GB | 82%     | **73%** | Coding champion 🏆      |
| **Phi-4**           | 14B        | 16K     | ~9GB  | **84%** | 38%     | STEM/reasoning 🧠       |
| **DeepSeek R1 14B** | 14B        | 128K    | ~9GB  | 79%     | 48%     | Chain-of-thought        |
| **Gemma 3 27B**     | 27B        | 128K    | ~18GB | 77%     | 45%     | Maximum quality         |
| **Gemma 3n E4B**    | 8B→4B      | 32K     | ~3GB  | 75%     | 32%     | Best balance ⭐         |
| **Gemma 3n E2B**    | 5B→2B      | 32K     | ~2GB  | 64%     | 25%     | Edge/mobile             |
| **Qwen3 4B**        | 4B         | 32K     | ~3GB  | 76%     | 35%     | Thinking mode 🧠        |
| **Qwen3 8B**        | 8B         | 32K     | ~5GB  | 81%     | 42%     | Multilingual + thinking |
| **Qwen3 14B**       | 14B        | 32K     | ~9GB  | 84%     | 48%     | Top multilingual 🌍     |
| **GPT-OSS 20B**     | 21B (3.6B) | 128K    | ~16GB | 82%     | 48%     | OpenAI open 🆕          |

### Key Insights

| Metric         | Best Local        | Best Cloud      | Local/Cloud  |
| -------------- | ----------------- | --------------- | ------------ |
| **MMLU**       | Phi-4: 84%        | GPT-5.2: 92%    | **91%**      |
| **SWE-Bench**  | MiniMax M2.1: 73% | Claude 4.5: 82% | **89%** 🔥   |
| **Cost/query** | **$0**            | $0.001-0.10     | **∞ better** |
| **Latency**    | **<100ms**        | 1-20s           | **10-100x**  |
| **Privacy**    | **100% local**    | Data sent       | **∞ better** |

**Benchmarks**: MMLU = general knowledge, GPQA = PhD-level science, SWE = coding tasks, Arena =
human preference

### Why Gemma 3n?

Gemma 3n uses **Matryoshka Transformer** architecture - more parameters compressed to less active
memory:

- **E2B**: 5B parameters → 2B effective, needs only ~2GB RAM
- **E4B**: 8B parameters → 4B effective, needs only ~3GB RAM

Same quality as Gemma 3, but faster and more memory-efficient. Perfect for edge/mobile deployment.

## Requirements

- Node.js 18+
- macOS 12+ / Linux / Windows
- For GPU: Apple Silicon Mac or NVIDIA GPU with CUDA
- For Gemma models: HuggingFace account with model access

## HuggingFace Token (for Gemma 3/3n)

Gemma models require HuggingFace authentication:

1. Create account at [huggingface.co](https://huggingface.co)
2. Accept Gemma license at [google/gemma-3](https://huggingface.co/google/gemma-3)
3. Create token at [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Set environment variable:

```bash
export HF_TOKEN="hf_your_token_here"
```

Or pass directly to the engine:

```typescript
const engine = new LLMEngine({
  model: "gemma-3n-e4b",
  huggingFaceToken: "hf_your_token_here"
})
```

## Installation

```bash
npm install native-llm
```

The first run will download the llama.cpp binaries optimized for your platform.

## Usage

### Basic Generation

```typescript
import { LLMEngine } from "native-llm"

const engine = new LLMEngine({ model: "gemma-3n-e4b" })
await engine.initialize()

const result = await engine.generate({
  prompt: "Explain quantum computing in simple terms.",
  maxTokens: 200,
  temperature: 0.7
})

console.log(result.text)
console.log(`${result.tokensPerSecond.toFixed(1)} tokens/sec`)

await engine.dispose()
```

### Streaming Output

```typescript
const result = await engine.generateStreaming(
  {
    prompt: "Write a short poem about coding.",
    maxTokens: 100
  },
  (token) => process.stdout.write(token)
)
```

### Chat API

```typescript
const result = await engine.chat(
  [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" }
  ],
  {
    maxTokens: 100
  }
)
```

### Model Aliases

Use short names for convenience:

```typescript
new LLMEngine({ model: "gemma" }) // → gemma-3n-e4b
new LLMEngine({ model: "gemma-large" }) // → gemma-3-27b
new LLMEngine({ model: "qwen" }) // → qwen3-8b
new LLMEngine({ model: "qwen-coder" }) // → qwen-2.5-coder-7b
new LLMEngine({ model: "deepseek" }) // → deepseek-r1-7b
new LLMEngine({ model: "minimax" }) // → minimax-m2.1
new LLMEngine({ model: "phi" }) // → phi-4
new LLMEngine({ model: "gpt-oss" }) // → gpt-oss-20b
```

### Recommended Models by Use Case

```typescript
import { RECOMMENDED_MODELS } from "native-llm"

RECOMMENDED_MODELS.fast // gemma-3n-e2b (~2GB)
RECOMMENDED_MODELS.balanced // gemma-3n-e4b (~3GB) ⭐
RECOMMENDED_MODELS.quality // gemma-3-27b (~18GB)
RECOMMENDED_MODELS.edge // gemma-3n-e2b (~2GB)
RECOMMENDED_MODELS.multilingual // qwen3-8b (~5GB)
RECOMMENDED_MODELS.reasoning // deepseek-r1-14b (~9GB)
RECOMMENDED_MODELS.code // minimax-m2.1 (~12GB) 🏆
RECOMMENDED_MODELS.longContext // gemma-3-27b (128K)
```

### Custom Models

Use any GGUF model from HuggingFace or local path:

```typescript
// HuggingFace model
new LLMEngine({ model: "hf:TheBloke/Mistral-7B-v0.1-GGUF/mistral-7b-v0.1.Q4_K_M.gguf" })

// Local file
new LLMEngine({ model: "/path/to/model.gguf" })
```

### GPU Configuration

```typescript
// All layers on GPU (default, fastest)
new LLMEngine({ model: "gemma-3n-e4b", gpuLayers: -1 })

// CPU only
new LLMEngine({ model: "gemma-3n-e4b", gpuLayers: 0 })

// Partial GPU offload (for large models)
new LLMEngine({ model: "gemma-3-27b", gpuLayers: 40 })
```

## API Reference

### `LLMEngine`

```typescript
class LLMEngine {
  constructor(options: EngineOptions)

  initialize(): Promise<void>
  generate(options: GenerateOptions): Promise<GenerateResult>
  generateStreaming(options: GenerateOptions, onToken: TokenCallback): Promise<GenerateResult>
  chat(messages: ChatMessage[], options?: GenerateOptions): Promise<GenerateResult>
  resetSession(): Promise<void>
  dispose(): Promise<void>

  isAvailable(): boolean
  getModelInfo(): ModelInfo
}
```

### Types

```typescript
interface EngineOptions {
  model: string // Model ID, alias, or path
  gpuLayers?: number // GPU layers (-1 = all)
  contextSize?: number // Context override
  huggingFaceToken?: string // For gated models
}

interface GenerateOptions {
  prompt: string
  systemPrompt?: string
  maxTokens?: number // Default: 256
  temperature?: number // Default: 0.7
  topP?: number // Default: 0.9
  topK?: number // Default: 40
  repeatPenalty?: number // Default: 1.1
  stop?: string[]
}

interface GenerateResult {
  text: string
  tokenCount: number
  promptTokenCount: number
  durationSeconds: number
  tokensPerSecond: number
  finishReason: "stop" | "length" | "error"
  model: string
}
```

## License

MIT

## Credits

- [llama.cpp](https://github.com/ggerganov/llama.cpp) - The underlying inference engine
- [node-llama-cpp](https://github.com/withcatai/node-llama-cpp) - Node.js bindings
- [bartowski](https://huggingface.co/bartowski) - High-quality GGUF quantizations
