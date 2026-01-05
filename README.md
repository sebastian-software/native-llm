<p align="center">
  <img src="https://raw.githubusercontent.com/sebastian-software/native-llm/main/.github/logo.svg" width="120" alt="native-llm logo" />
</p>

<h1 align="center">native-llm</h1>

<p align="center">
  <strong>The easiest way to run AI models locally.</strong>
</p>

<p align="center">
  <a href="https://github.com/sebastian-software/native-llm/actions/workflows/ci.yml"><img src="https://github.com/sebastian-software/native-llm/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/sebastian-software/native-llm"><img src="https://codecov.io/gh/sebastian-software/native-llm/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/native-llm"><img src="https://img.shields.io/npm/v/native-llm.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/native-llm"><img src="https://img.shields.io/npm/dm/native-llm.svg" alt="npm downloads"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-why-native-llm">Why native-llm</a> •
  <a href="#-models">Models</a> •
  <a href="https://sebastian-software.github.io/native-llm/">Documentation</a>
</p>

---

## 🚀 Quick Start

```bash
npm install native-llm
```

```typescript
import { LLMEngine } from "native-llm"

const engine = new LLMEngine({ model: "gemma" })

const result = await engine.generate({
  prompt: "Explain quantum computing to a 5-year-old"
})

console.log(result.text)
```

**That's it.** Model downloads automatically. GPU detected automatically. Just works.

---

## 🎯 Why native-llm?

**A friendly wrapper around [llama.cpp](https://github.com/ggerganov/llama.cpp) that handles the
hard parts:**

| Without native-llm         | With native-llm         |
| -------------------------- | ----------------------- |
| Find GGUF model URLs       | `model: "gemma"`        |
| Configure HuggingFace auth | Auto from `HF_TOKEN`    |
| 20+ lines boilerplate      | 3 lines                 |
| Research model benchmarks  | Curated recommendations |

### Local vs Cloud

|             | ☁️ Cloud AI              | 🏠 native-llm        |
| ----------- | ------------------------ | -------------------- |
| **Cost**    | $0.001 - $0.10 per query | **Free forever**     |
| **Speed**   | 1-20 seconds             | **< 100ms**          |
| **Privacy** | Data sent to servers     | **100% local**       |
| **Limits**  | Rate limits & quotas     | **Unlimited**        |
| **Offline** | ❌ Requires internet     | ✅ **Works offline** |

---

## 🎨 Models

### Simple Aliases

```typescript
new LLMEngine({ model: "gemma" }) // Best balance (default)
new LLMEngine({ model: "gemma-fast" }) // Maximum speed
new LLMEngine({ model: "qwen-coder" }) // Code generation
new LLMEngine({ model: "deepseek" }) // Complex reasoning
```

### Smart Recommendations

```typescript
import { LLMEngine } from "native-llm"

// Get the right model for your use case
const model = LLMEngine.getModelForUseCase("code") // → qwen-2.5-coder-7b
const model = LLMEngine.getModelForUseCase("fast") // → gemma-3n-e2b
const model = LLMEngine.getModelForUseCase("quality") // → gemma-3-27b

// List all available models
const models = LLMEngine.listModels()
// → [{ id: "gemma-3n-e4b", name: "Gemma 3n E4B", size: "5 GB", ... }, ...]
```

### Performance (M1 Ultra)

| Model                 | Size  | Speed        | Best For          |
| --------------------- | ----- | ------------ | ----------------- |
| 🚀 **Gemma 3n E2B**   | 3 GB  | **36 tok/s** | Maximum speed     |
| ⭐ **Gemma 3n E4B**   | 5 GB  | **18 tok/s** | Best balance      |
| 💻 **Qwen 2.5 Coder** | 5 GB  | **23 tok/s** | Code generation   |
| 🧠 **DeepSeek R1**    | 5 GB  | **9 tok/s**  | Complex reasoning |
| 👑 **Gemma 3 27B**    | 18 GB | **5 tok/s**  | Maximum quality   |

---

## ✨ Features

| Feature               | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| 📦 **Zero Config**    | Models download automatically, GPU detected automatically  |
| 🎯 **Smart Defaults** | Curated models, sensible parameters, thinking-mode handled |
| 🔥 **Native Speed**   | Direct llama.cpp bindings — no Python, no subprocess       |
| 🍎 **Metal GPU**      | Full Apple Silicon acceleration out of the box             |
| 🖥️ **Cross-Platform** | macOS, Linux, Windows with CUDA support                    |
| 🌊 **Streaming**      | Real-time token-by-token output                            |
| 📝 **TypeScript**     | Full type definitions included                             |

---

## 🔑 Setup for Gemma Models

Gemma models require a free HuggingFace token:

```bash
export HF_TOKEN="hf_your_token_here"
```

Get yours in 30 seconds: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

---

## 📚 Documentation

**[→ Full Documentation](https://sebastian-software.github.io/native-llm/)** — Streaming, chat API,
custom models, and more.

<p align="center">
  <strong>MIT License</strong> · Made with ❤️ by <a href="https://sebastian-software.de">Sebastian Software</a>
  <br/>
  <sub>Powered by <a href="https://github.com/ggerganov/llama.cpp">llama.cpp</a> & <a href="https://github.com/withcatai/node-llama-cpp">node-llama-cpp</a></sub>
</p>
