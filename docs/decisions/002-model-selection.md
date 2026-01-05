# ADR 002: Model Selection Strategy

**Status**: Accepted (Updated 2026-01-05) **Date**: 2026-01-05 **Decision**: Focus on top-tier
models only, prioritize quality over quantity

## Context

With access to 1000+ GGUF models, we needed to define:

1. Which models to include in our curated list
2. Default recommendations by use case
3. Which model families to prioritize

## Goals

- **International text processing**: Understanding, correcting, summarizing multilingual text
- **Efficiency**: Best quality per RAM/compute
- **Practical deployment**: Models that run on typical hardware (8-64GB RAM)

## Final Model Selection (12 Models)

### Tier 1: Recommended

| Model               | Params    | RAM   | MMLU | Best For            |
| ------------------- | --------- | ----- | ---- | ------------------- |
| **Gemma 3n E4B**    | 8B→4B     | ~3GB  | 75%  | Default choice ⭐   |
| **MiniMax M2.1**    | 45B (10B) | ~12GB | 82%  | Coding (73% SWE) 🏆 |
| **Phi-4**           | 14B       | ~9GB  | 84%  | STEM/reasoning 🧠   |
| **DeepSeek R1 14B** | 14B       | ~9GB  | 79%  | Chain-of-thought    |

### Tier 2: Specialized

| Model               | Params     | RAM    | MMLU   | Best For          |
| ------------------- | ---------- | ------ | ------ | ----------------- |
| **Gemma 3 27B**     | 27B        | ~18GB  | 77%    | Maximum quality   |
| **GPT-OSS 20B**     | 21B (3.6B) | ~16GB  | 82%    | OpenAI open model |
| **Qwen 2.5 7B/14B** | 7B/14B     | ~5-9GB | 74-79% | Multilingual      |
| **Qwen 2.5 Coder**  | 7B         | ~5GB   | 66%    | Code generation   |

### Tier 3: Efficient

| Model              | Params | RAM  | MMLU | Best For       |
| ------------------ | ------ | ---- | ---- | -------------- |
| **Gemma 3n E2B**   | 5B→2B  | ~2GB | 64%  | Edge/mobile    |
| **DeepSeek R1 7B** | 7B     | ~5GB | 72%  | Fast reasoning |
| **GLM-4 9B**       | 9B     | ~6GB | 72%  | Multilingual   |

## Removed Models & Rationale

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

### SmolLM2

**Decision**: ❌ Removed

- Test-only models not suitable for production
- Was only included for initial development testing

### GPT-OSS 120B

**Decision**: ❌ Removed

- Requires 80GB RAM - impractical for most users
- 20B variant sufficient (82% MMLU, 16GB RAM)

### GLM-4.7 9B

**Decision**: ❌ Removed (for now)

- GGUF not yet available
- Will add when community converts it

## Key Decisions

### 1. Default Model

```typescript
new LLMEngine({ model: "gemma" }) // → gemma-3n-e4b
```

Rationale: Best balance of quality (75% MMLU), speed, and memory (3GB).

### 2. Recommended Models by Use Case

| Use Case     | Model           | Why                        |
| ------------ | --------------- | -------------------------- |
| Fast         | gemma-3n-e2b    | 2GB RAM, instant responses |
| Balanced     | gemma-3n-e4b    | Best quality/speed ratio   |
| Quality      | gemma-3-27b     | 77% MMLU, 128K context     |
| Edge         | gemma-3n-e2b    | Minimal resources          |
| Multilingual | qwen-2.5-7b     | Excellent 10+ languages    |
| Reasoning    | deepseek-r1-14b | Chain-of-thought           |
| Code         | minimax-m2.1    | 73% SWE-Bench 🏆           |
| Long Context | gemma-3-27b     | 128K tokens                |

### 3. No More "Chinese" Category

Removed special "chinese" recommendation - GLM-4 is multilingual, not Chinese-only. Users in China
can choose GLM-4 or Qwen based on their needs.

### 4. Authentication Strategy

**Changed**: Most models now available without HuggingFace token!

Using `unsloth` repos for Gemma models provides unrestricted access:

- `unsloth/gemma-3n-E2B-it-GGUF` ✅ No auth
- `unsloth/gemma-3n-E4B-it-GGUF` ✅ No auth
- `unsloth/gemma-3-27b-it-GGUF` ✅ No auth

Only `bartowski` repos require auth for some models.

## Consequences

### Positive

- Lean model list (12 models vs 21+)
- Every model serves a clear purpose
- No redundancy between models
- Most models work without authentication

### Negative

- Users accustomed to Llama/Mistral need to migrate
- Some niche use cases may need custom model paths

## Benchmark Sources

- MMLU: Massive Multitask Language Understanding
- SWE-Bench: Real-world coding task completion
- Arena ELO: Human preference ratings (Chatbot Arena)

All benchmarks from official model papers and lmsys.org leaderboard.
