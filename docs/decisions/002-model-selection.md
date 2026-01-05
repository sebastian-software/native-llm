# ADR 002: Model Selection Strategy

**Status**: Updated **Date**: 2026-01-05 **Decision**: Focus on top-tier models only, prioritize
quality over quantity

## Context

With access to 1000+ GGUF models, we needed to define:

1. Which models to include in our curated list
2. Default recommendations by use case
3. Which model families to prioritize

## Goals

- **International text processing**: Understanding, correcting, summarizing multilingual text
- **Efficiency**: Best quality per RAM/compute
- **Practical deployment**: Models that run on typical hardware (8-64GB RAM)

## Final Model Selection (11 Models)

### Tier 1: Recommended

| Model               | Params | RAM  | MMLU | Best For          |
| ------------------- | ------ | ---- | ---- | ----------------- |
| **Gemma 3n E4B**    | 8B→4B  | ~5GB | 75%  | Default choice ⭐ |
| **Phi-4**           | 14B    | ~9GB | 84%  | STEM/reasoning 🧠 |
| **DeepSeek R1 14B** | 14B    | ~9GB | 79%  | Chain-of-thought  |

### Tier 2: Specialized

| Model              | Params | RAM   | MMLU | Best For           |
| ------------------ | ------ | ----- | ---- | ------------------ |
| **Gemma 3 27B**    | 27B    | ~18GB | 77%  | Maximum quality    |
| **Qwen3 8B**       | 8B     | ~5GB  | 81%  | Multilingual 🌍    |
| **Qwen3 14B**      | 14B    | ~9GB  | 84%  | Top multilingual   |
| **Qwen 2.5 Coder** | 7B     | ~5GB  | 66%  | Code generation 💻 |

### Tier 3: Efficient

| Model              | Params | RAM  | MMLU | Best For       |
| ------------------ | ------ | ---- | ---- | -------------- |
| **Gemma 3n E2B**   | 5B→2B  | ~3GB | 64%  | Edge/mobile 🚀 |
| **Qwen3 4B**       | 4B     | ~3GB | 76%  | Fast thinking  |
| **DeepSeek R1 7B** | 7B     | ~5GB | 72%  | Fast reasoning |

### Tier 4: Experimental (Not Fully Working)

| Model           | Params     | Status           | Issue                   |
| --------------- | ---------- | ---------------- | ----------------------- |
| **GPT-OSS 20B** | 21B (3.6B) | ⚠️ Chat template | May need wrapper update |

## Removed Models & Rationale

### Resource-Prohibitive Models

These models exceed practical hardware limits for most developers:

| Model            | Download | RAM Required | Alternative          |
| ---------------- | -------- | ------------ | -------------------- |
| **MiniMax M2.1** | 129 GB   | ~140 GB      | Qwen 2.5 Coder (4GB) |
| **GPT-OSS 120B** | ~80 GB   | ~90 GB       | GPT-OSS 20B (14GB)   |

> 💡 Users with sufficient hardware can use custom model paths:
> `new LLMEngine({ model: "/path/to/model.gguf" })`

### Llama 3.x (All variants)

**Decision**: ❌ Removed

- Llama 3.2 1B/3B: Too weak (49-63% MMLU)
- Llama 3.1 8B: Outperformed by Qwen and Gemma at same size
- Ecosystem compatibility not sufficient justification

### Mistral (All variants)

**Decision**: ❌ Removed

- Mistral 7B v0.3: Outdated (63% MMLU)
- Mistral Nemo 12B: Mediocre (68% MMLU), 128K context available elsewhere
- European language focus not unique enough

### Gemma 3 4B/12B

**Decision**: ❌ Removed

- Redundant with Gemma 3n for most use cases
- Only 27B kept for users needing 128K context + maximum quality
- 3n provides same quality at lower RAM

### Small Models (DeepSeek 1.5B, Qwen 1.5B/3B)

**Decision**: ❌ Removed

- Too weak for practical use
- Gemma 3n E2B (64% MMLU) better choice for constrained environments

### GLM-4 9B

**Decision**: ❌ Not implemented

- GGUF not yet available from reliable sources
- Will add when community converts it

## Key Decisions

### 1. Default Model

```typescript
new LLMEngine({ model: "gemma" }) // → gemma-3n-e4b
```

Rationale: Best balance of quality (75% MMLU), speed (18 tok/s), and memory (5GB).

### 2. Recommended Models by Use Case

| Use Case     | Model           | Why                      |
| ------------ | --------------- | ------------------------ |
| Fast         | gemma-3n-e2b    | 3GB RAM, 36 tok/s        |
| Balanced     | gemma-3n-e4b    | Best quality/speed ratio |
| Quality      | gemma-3-27b     | 77% MMLU, 128K context   |
| Edge         | gemma-3n-e2b    | Minimal resources        |
| Multilingual | qwen3-8b        | Excellent 10+ languages  |
| Reasoning    | deepseek-r1-14b | Chain-of-thought         |
| Code         | qwen-2.5-coder  | Optimized for code       |
| Long Context | gemma-3-27b     | 128K tokens              |

### 3. Thinking Mode Models

Qwen3 and DeepSeek R1 support chain-of-thought reasoning. See [ADR 003](./003-thinking-mode.md) for
implementation details.

| Model          | Thinking Mode | Default Behavior         |
| -------------- | ------------- | ------------------------ |
| Qwen3 \*       | Optional      | Disabled via `/no_think` |
| DeepSeek R1 \* | Always on     | More tokens allocated    |

### 4. Authentication Strategy

**Changed**: Most models now available without HuggingFace token!

Using `unsloth` repos for Gemma models provides unrestricted access:

- `unsloth/gemma-3n-E2B-it-GGUF` ✅ No auth
- `unsloth/gemma-3n-E4B-it-GGUF` ✅ No auth
- `unsloth/gemma-3-27b-it-GGUF` ✅ No auth

Only `bartowski` repos require auth for some models.

## Consequences

### Positive

- Lean model list (11 working models)
- Every model serves a clear purpose
- No redundancy between models
- Most models work without authentication
- Thinking-mode models now work correctly

### Negative

- Users accustomed to Llama/Mistral need to migrate
- MiniMax fans need to use custom model paths
- Some niche use cases may need custom model paths

## Benchmark Sources

- MMLU: Massive Multitask Language Understanding
- SWE-Bench: Real-world coding task completion
- Arena ELO: Human preference ratings (Chatbot Arena)

All benchmarks from official model papers and lmsys.org leaderboard.

## Performance Benchmarks (M1 Ultra)

| Model          | Avg tok/s | Notes             |
| -------------- | --------- | ----------------- |
| Gemma 3n E2B   | 36        | Fastest 🚀        |
| Qwen 2.5 Coder | 23        | Code optimized    |
| Gemma 3n E4B   | 18        | Best balance ⭐   |
| Qwen3 8B       | 17        | Multilingual      |
| Phi-4          | 12        | STEM/reasoning    |
| DeepSeek R1 7B | 9         | Thinks internally |
| Gemma 3 27B    | 5         | Maximum quality   |
