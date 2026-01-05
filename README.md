# native-llm

[![CI](https://github.com/sebastian-software/native-llm/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/native-llm/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/sebastian-software/native-llm/graph/badge.svg)](https://codecov.io/gh/sebastian-software/native-llm)
[![npm version](https://img.shields.io/npm/v/native-llm.svg)](https://www.npmjs.com/package/native-llm)
[![npm downloads](https://img.shields.io/npm/dm/native-llm.svg)](https://www.npmjs.com/package/native-llm)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> High-performance LLM inference in Node.js

Run LLMs locally with [llama.cpp](https://github.com/ggerganov/llama.cpp) — Metal GPU on Apple
Silicon, CUDA on NVIDIA, CPU everywhere else.

## Quick Start

```bash
npm install native-llm
```

```typescript
import { LLMEngine } from "native-llm"

const engine = new LLMEngine({ model: "gemma-3n-e4b" })
await engine.initialize()

const result = await engine.generate({
  prompt: "Explain quantum computing briefly.",
  maxTokens: 200
})

console.log(result.text)
await engine.dispose()
```

## Model Recommendations

| Use Case      | Model            | RAM   | Speed       |
| ------------- | ---------------- | ----- | ----------- |
| **Fast**      | `gemma-3n-e2b`   | ~3 GB | 36 tok/s 🚀 |
| **Balanced**  | `gemma-3n-e4b`   | ~5 GB | 18 tok/s ⭐ |
| **Quality**   | `gemma-3-27b`    | ~18GB | 5 tok/s     |
| **Code**      | `qwen-2.5-coder` | ~5 GB | 23 tok/s    |
| **Reasoning** | `deepseek-r1-7b` | ~5 GB | 9 tok/s 🧠  |

## Features

- **Native Performance** — Direct N-API bindings, no subprocess overhead
- **GPU Acceleration** — Metal (Apple), CUDA (NVIDIA), CPU fallback
- **Auto-Download** — Models fetched from HuggingFace automatically
- **Streaming** — Real-time token-by-token output
- **TypeScript** — Full type definitions included

## Documentation

📖 **[Full Documentation](https://sebastian-software.github.io/native-llm/)** — Benchmarks, model
comparison, usage examples, API reference

## HuggingFace Token

Gemma models require authentication:

```bash
export HF_TOKEN="hf_your_token_here"
```

Get your token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) after
accepting the [Gemma license](https://huggingface.co/google/gemma-3).

## License

MIT

## Credits

- [llama.cpp](https://github.com/ggerganov/llama.cpp) — Inference engine
- [node-llama-cpp](https://github.com/withcatai/node-llama-cpp) — Node.js bindings
- [bartowski](https://huggingface.co/bartowski) — GGUF quantizations
