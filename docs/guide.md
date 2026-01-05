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

## Performance Benchmarks

Tested on **Apple M1 Ultra** with Metal GPU acceleration. Three tasks of increasing complexity:

| Model              | Params | Size   | Load | Simple   | Medium   | Code     | Avg             |
| ------------------ | ------ | ------ | ---- | -------- | -------- | -------- | --------------- |
| **Gemma 3n E2B**   | 5B→2B  | 2.8 GB | 2.1s | 18 tok/s | 34 tok/s | 36 tok/s | **36 tok/s** 🚀 |
| **Qwen 2.5 Coder** | 7B     | 4.4 GB | 3.5s | 5 tok/s  | 20 tok/s | 24 tok/s | **23 tok/s**    |
| **Gemma 3n E4B**   | 8B→4B  | 4.2 GB | 3.0s | 10 tok/s | 26 tok/s | 18 tok/s | **18 tok/s** ⭐ |
| **Qwen3 8B**       | 8B     | 4.7 GB | 4.0s | 5 tok/s  | 12 tok/s | 19 tok/s | **17 tok/s**    |
| **Phi-4**          | 14B    | 8.4 GB | 6.5s | 1 tok/s  | 12 tok/s | 13 tok/s | **12 tok/s**    |
| **DeepSeek R1 7B** | 7B     | 4.4 GB | 2.4s | 3 tok/s  | 8 tok/s  | 10 tok/s | **9 tok/s** 🧠  |
| **Gemma 3 27B**    | 27B    | 16 GB  | 154s | 2 tok/s  | 5 tok/s  | 5 tok/s  | **5 tok/s**     |

**Tasks**: Simple = quick math, Medium = concept explanation, Code = TypeScript function

> 💡 **Recommendation**: Start with **Gemma 3n E4B** for the best quality/speed balance. Use **E2B**
> for maximum speed, **Qwen3** for multilingual, or **DeepSeek R1** for complex reasoning tasks.

Run your own benchmarks:

```bash
pnpm benchmark                    # Test default models
pnpm benchmark gemma-3n-e4b phi-4 # Test specific models
```

## Model Comparison

### Cloud Services (Reference)

| Model               | Provider  | Params | MMLU | GPQA | SWE | Arena |
| ------------------- | --------- | ------ | ---- | ---- | --- | ----- |
| **GPT-5.2**         | OpenAI    | ~2T    | 92%  | 89%  | 78% | ~1420 |
| **Claude 4.5 Opus** | Anthropic | ~200B  | 91%  | 88%  | 82% | ~1400 |
| **Gemini 3**        | Google    | ~300B  | 90%  | 87%  | 62% | ~1380 |
| **DeepSeek V3**     | DeepSeek  | 671B   | 88%  | 82%  | 72% | ~1350 |

### Top Local Models

| Model               | Params | Context | RAM   | MMLU    | Best For           |
| ------------------- | ------ | ------- | ----- | ------- | ------------------ |
| **Phi-4**           | 14B    | 16K     | ~9GB  | **84%** | STEM/reasoning 🧠  |
| **Gemma 3 27B**     | 27B    | 128K    | ~18GB | 77%     | Maximum quality    |
| **Gemma 3n E4B**    | 8B→4B  | 32K     | ~5GB  | 75%     | Best balance ⭐    |
| **Gemma 3n E2B**    | 5B→2B  | 32K     | ~3GB  | 64%     | Edge/mobile        |
| **Qwen 2.5 Coder**  | 7B     | 128K    | ~5GB  | 66%     | Code generation 💻 |
| **DeepSeek R1 14B** | 14B    | 128K    | ~9GB  | 79%     | Chain-of-thought   |

### Local vs Cloud

| Metric         | Best Local     | Best Cloud   | Comparison   |
| -------------- | -------------- | ------------ | ------------ |
| **MMLU**       | Phi-4: 84%     | GPT-5.2: 92% | **91%**      |
| **Cost/query** | **$0**         | $0.001-0.10  | **∞ better** |
| **Latency**    | **<100ms**     | 1-20s        | **10-100x**  |
| **Privacy**    | **100% local** | Data sent    | **∞ better** |

**Benchmarks**: MMLU = general knowledge, GPQA = PhD-level science, SWE = coding tasks, Arena =
human preference

### Why Gemma 3n?

Gemma 3n uses **Matryoshka Transformer** architecture - more parameters compressed to less active
memory:

- **E2B**: 5B parameters → 2B effective, needs only ~2GB RAM
- **E4B**: 8B parameters → 4B effective, needs only ~3GB RAM

Same quality as Gemma 3, but faster and more memory-efficient. Perfect for edge/mobile deployment.

### Models Not Included

Some models are excluded due to impractical resource requirements:

| Model            | Size   | RAM Required | Reason             |
| ---------------- | ------ | ------------ | ------------------ |
| **MiniMax M2.1** | 129 GB | ~140 GB      | Download too large |
| **GPT-OSS 120B** | ~80 GB | ~90 GB       | RAM impractical    |

> 💡 Use custom model paths if you have the hardware:
> `new LLMEngine({ model: "/path/to/model.gguf" })`

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

## Usage Examples

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
new LLMEngine({ model: "phi" }) // → phi-4
new LLMEngine({ model: "gpt-oss" }) // → gpt-oss-20b
```

### Recommended Models by Use Case

```typescript
import { RECOMMENDED_MODELS } from "native-llm"

RECOMMENDED_MODELS.fast // gemma-3n-e2b (~3GB)
RECOMMENDED_MODELS.balanced // gemma-3n-e4b (~5GB) ⭐
RECOMMENDED_MODELS.quality // gemma-3-27b (~18GB)
RECOMMENDED_MODELS.edge // gemma-3n-e2b (~3GB)
RECOMMENDED_MODELS.multilingual // qwen3-8b (~5GB)
RECOMMENDED_MODELS.reasoning // deepseek-r1-14b (~9GB)
RECOMMENDED_MODELS.code // qwen-2.5-coder-7b (~5GB)
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

### Thinking Mode (Qwen3, DeepSeek R1)

Some models support chain-of-thought reasoning. By default, thinking is disabled for faster
responses:

```typescript
// Default: Fast responses without visible thinking
new LLMEngine({ model: "qwen3-8b" })

// Enable thinking for complex reasoning tasks
new LLMEngine({ model: "qwen3-8b", enableThinking: true })

// DeepSeek R1 always "thinks" internally (needs more tokens)
new LLMEngine({ model: "deepseek-r1-7b" }) // Auto-adjusts token limits
```
