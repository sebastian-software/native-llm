<p align="center">
  <img src="https://raw.githubusercontent.com/sebastian-software/native-llm/main/.github/logo.svg" width="120" alt="native-llm logo" />
</p>

<h1 align="center">native-llm</h1>

<p align="center">
  <strong>Run AI models locally. No cloud. No limits. No cost.</strong>
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

## 🎯 Why native-llm?

|             | ☁️ Cloud AI              | 🏠 native-llm        |
| ----------- | ------------------------ | -------------------- |
| **Cost**    | $0.001 - $0.10 per query | **Free forever**     |
| **Speed**   | 1-20 seconds             | **< 100ms**          |
| **Privacy** | Data sent to servers     | **100% local**       |
| **Limits**  | Rate limits & quotas     | **Unlimited**        |
| **Offline** | ❌ Requires internet     | ✅ **Works offline** |

**The bottom line:** Local models now achieve **91% of GPT-5's quality** — at zero cost.

---

## 🚀 Quick Start

```bash
npm install native-llm
```

```typescript
import { LLMEngine } from "native-llm"

// That's it. One line to load a model.
const engine = new LLMEngine({ model: "gemma" })

const result = await engine.generate({
  prompt: "Explain quantum computing to a 5-year-old"
})

console.log(result.text)
// → "Imagine you have a magical coin that can be heads AND tails at the same time..."
```

Models download automatically on first use. No setup. No configuration. Just works.

---

## ⚡ Performance

Benchmarked on **Apple M1 Ultra** with Metal GPU acceleration:

| Model                 | Size  | Speed        | Best For          |
| --------------------- | ----- | ------------ | ----------------- |
| 🚀 **Gemma 3n E2B**   | 3 GB  | **36 tok/s** | Maximum speed     |
| ⭐ **Gemma 3n E4B**   | 5 GB  | **18 tok/s** | Best balance      |
| 💻 **Qwen 2.5 Coder** | 5 GB  | **23 tok/s** | Code generation   |
| 🧠 **DeepSeek R1**    | 5 GB  | **9 tok/s**  | Complex reasoning |
| 👑 **Gemma 3 27B**    | 18 GB | **5 tok/s**  | Maximum quality   |

> 💡 **Our pick:** Start with `gemma-3n-e4b` — it's the sweet spot of quality and speed.

---

## 🎨 Models

Use simple aliases — we handle the rest:

```typescript
new LLMEngine({ model: "gemma" }) // Fast & efficient
new LLMEngine({ model: "gemma-large" }) // Maximum quality
new LLMEngine({ model: "qwen-coder" }) // Code generation
new LLMEngine({ model: "deepseek" }) // Chain-of-thought reasoning
new LLMEngine({ model: "phi" }) // STEM & science
```

Or use any of the **1000+ GGUF models** on HuggingFace:

```typescript
new LLMEngine({ model: "/path/to/any-model.gguf" })
```

---

## ✨ Features

| Feature               | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| 🔥 **Native Speed**   | Direct N-API bindings to llama.cpp — no subprocess overhead |
| 🍎 **Metal GPU**      | Full Apple Silicon acceleration out of the box              |
| 🖥️ **Cross-Platform** | macOS, Linux, Windows — CUDA support for NVIDIA             |
| 📦 **Auto-Download**  | Models fetched from HuggingFace automatically               |
| 🌊 **Streaming**      | Real-time token-by-token output                             |
| 📝 **TypeScript**     | Full type definitions included                              |

---

## 🔑 Setup for Gemma Models

Gemma models require a free HuggingFace token:

```bash
export HF_TOKEN="hf_your_token_here"
```

Get yours in 30 seconds: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

---

## 📚 Documentation

**[→ Full Documentation](https://sebastian-software.github.io/native-llm/)** — Benchmarks, model
comparison, streaming, chat API, and more.

---

## 💖 Credits

Built on the shoulders of giants:

- [llama.cpp](https://github.com/ggerganov/llama.cpp) — The inference engine that makes this
  possible
- [node-llama-cpp](https://github.com/withcatai/node-llama-cpp) — Excellent Node.js bindings
- [bartowski](https://huggingface.co/bartowski) — High-quality GGUF quantizations

---

<p align="center">
  <strong>MIT License</strong> · Made with ❤️ by <a href="https://sebastian-software.de">Sebastian Software</a>
</p>
