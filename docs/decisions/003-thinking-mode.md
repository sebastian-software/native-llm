# ADR 003: Thinking Mode Support for Reasoning Models

**Status**: Accepted **Date**: 2026-01-05 **Decision**: Auto-disable thinking mode for faster
responses, with opt-in for chain-of-thought reasoning

## Context

Some modern LLMs (Qwen3, DeepSeek R1) support "thinking mode" where they reason internally before
answering. This causes two problems:

1. **Empty responses**: Models return empty strings because the answer is in a "thought" segment
2. **Slow responses**: Internal reasoning consumes tokens without visible output

We needed a strategy to make these models work out-of-the-box while preserving access to their
reasoning capabilities.

## Problem Discovery

During benchmarking, Qwen3 and DeepSeek R1 models returned near-empty responses:

```
Qwen3 8B: "" (0 tokens)
DeepSeek R1 7B: "" (1 token)
```

Investigation revealed:

- **Qwen3**: Uses `QwenChatWrapper`, response stored as `"thought"` segment
- **DeepSeek R1**: Uses `DeepSeekChatWrapper`, thinks before answering (needs more tokens)

## Options Considered

### Option 1: Document "Use More Tokens"

**Approach**: Tell users to use `maxTokens: 500+` for reasoning models.

**Pros**:

- No code changes
- Users learn about model behavior

**Cons**:

- ❌ Poor developer experience (models appear broken)
- ❌ Inconsistent performance in benchmarks
- ❌ Qwen3 still returns empty with any token count

**Result**: ❌ Rejected

### Option 2: Auto-Detect and Fix ✅

**Approach**: Detect thinking-mode models and adjust behavior automatically.

**Pros**:

- ✅ Models work out-of-the-box
- ✅ Consistent benchmarks
- ✅ Opt-in for advanced users

**Cons**:

- Slightly more complex engine code
- Users might not discover thinking mode

**Result**: ✅ Accepted

## Decision

### 1. Add `thinkingMode` to Model Definitions

```typescript
"qwen3-8b": {
  // ...
  thinkingMode: "qwen"  // Supports /no_think prefix
}

"deepseek-r1-7b": {
  // ...
  thinkingMode: "deepseek"  // Always thinks, needs more tokens
}
```

### 2. Add `enableThinking` Option

```typescript
interface EngineOptions {
  // ...
  enableThinking?: boolean // Default: false
}
```

### 3. Auto-Adjust Based on Model Type

| Model Type   | `enableThinking: false` (default) | `enableThinking: true`  |
| ------------ | --------------------------------- | ----------------------- |
| **Qwen3**    | Prepend `/no_think` to prompt     | Normal prompt           |
| **DeepSeek** | Use default `maxTokens` (256)     | Use default `maxTokens` |
| **Others**   | No change                         | No change               |

### 4. Adjust Token Limits for DeepSeek

DeepSeek R1 always "thinks" internally, so we increase the default `maxTokens` from 256 to 512 for
these models to ensure the thinking phase completes.

## Implementation

### Engine Changes

```typescript
private preparePrompt(prompt: string): string {
  const thinkingMode = this.getThinkingMode()

  if (thinkingMode === "qwen" && !this.enableThinking) {
    return `/no_think ${prompt}`
  }

  return prompt
}

private getDefaultMaxTokens(): number {
  const thinkingMode = this.getThinkingMode()

  if (thinkingMode === "deepseek") {
    return 512  // Extra tokens for thinking + response
  }

  return 256
}
```

## Consequences

### Positive

- ✅ Qwen3 and DeepSeek R1 work immediately after install
- ✅ Consistent benchmark results
- ✅ Users can opt-in to thinking mode for complex tasks
- ✅ No breaking changes to existing API

### Negative

- Users may not discover thinking mode exists
- `/no_think` prefix is Qwen-specific (tight coupling)
- DeepSeek's thinking cannot be disabled

## Performance Impact

| Model              | Before Fix | After Fix |
| ------------------ | ---------- | --------- |
| **Qwen3 8B**       | 0 tok/s    | 17 tok/s  |
| **DeepSeek R1 7B** | 0 tok/s    | 9 tok/s   |

DeepSeek is slower because it still thinks internally - this is inherent to the model.

## Future Considerations

1. **Expose thinking output**: Could add `onThinkingChunk` callback for streaming thinking
2. **Per-request override**: Could add `enableThinking` to `GenerateOptions`
3. **Other thinking models**: Watch for new models with similar behavior
