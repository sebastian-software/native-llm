# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant decisions made during
the development of `native-llm`.

## Index

| ADR                               | Title                                      | Status   | Date       |
| --------------------------------- | ------------------------------------------ | -------- | ---------- |
| [001](./001-runtime-selection.md) | Runtime Selection for Local LLM Inference  | Accepted | 2026-01-05 |
| [002](./002-model-selection.md)   | Model Selection Strategy                   | Updated  | 2026-01-05 |
| [003](./003-thinking-mode.md)     | Thinking Mode Support for Reasoning Models | Accepted | 2026-01-05 |

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

Curated list of 11 models focusing on quality over quantity.

**Kept**:

- Gemma 3n E2B/E4B (edge/balanced)
- Gemma 3 27B (maximum quality)
- Phi-4 (STEM/reasoning)
- DeepSeek R1 7B/14B (chain-of-thought)
- Qwen3 4B/8B/14B (multilingual + thinking)
- Qwen 2.5 Coder (code generation)

**Removed**:

- Llama 3.x (all) - outperformed by alternatives
- Mistral (all) - outdated
- Gemma 3 4B/12B - redundant with 3n
- Small models (<3B) - too weak
- MiniMax M2.1 - 129GB download impractical
- GPT-OSS 120B - 80GB RAM impractical

### Thinking Mode: Auto-Disable ✅

Reasoning models (Qwen3, DeepSeek R1) have "thinking mode" disabled by default for faster responses.

**Implementation**:

- Qwen3: Auto-prepend `/no_think` prefix
- DeepSeek R1: Increase default token limit (512 vs 256)
- Users can opt-in via `enableThinking: true`

**Result**: Models that previously returned empty responses now work at 9-17 tok/s.
