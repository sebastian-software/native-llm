# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant decisions made during
the development of `native-llm`.

## Index

| ADR                               | Title                                     | Status   | Date       |
| --------------------------------- | ----------------------------------------- | -------- | ---------- |
| [001](./001-runtime-selection.md) | Runtime Selection for Local LLM Inference | Accepted | 2026-01-05 |
| [002](./002-model-selection.md)   | Model Selection Strategy                  | Updated  | 2026-01-05 |

## Format

Each ADR follows this structure:

- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Date**: When the decision was made
- **Context**: Why the decision was needed
- **Options**: Alternatives considered
- **Decision**: What was decided
- **Consequences**: Trade-offs and implications

## Summary of Decisions

### Runtime: llama.cpp ✅

Selected `node-llama-cpp` for native Node.js integration with Metal GPU acceleration.

**Rejected approaches**:

- CoreML: Memory issues (100GB+ for conversion), ANE 4GB limit
- MLX: Metal shader compilation issues, subprocess-only integration

### Models: Top-Tier Only ✅

Curated list of 12 models focusing on quality over quantity.

**Kept**:

- Gemma 3n E2B/E4B (edge/balanced)
- Gemma 3 27B (maximum quality)
- GPT-OSS 20B (OpenAI open model)
- MiniMax M2.1 (coding champion)
- Phi-4 (STEM/reasoning)
- DeepSeek R1 7B/14B (chain-of-thought)
- Qwen 2.5 7B/14B/Coder (multilingual)
- GLM-4 9B (multilingual)

**Removed**:

- Llama 3.x (all) - outperformed by alternatives
- Mistral (all) - outdated
- Gemma 3 4B/12B - redundant with 3n
- Small models (<3B) - too weak
- GPT-OSS 120B - 80GB RAM impractical
