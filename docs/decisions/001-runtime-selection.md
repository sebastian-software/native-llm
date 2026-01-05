# ADR 001: Runtime Selection for Local LLM Inference

**Status**: Accepted **Date**: 2026-01-05 **Decision**: Use `llama.cpp` via `node-llama-cpp` for LLM
inference

## Context

We needed a native Node.js solution for running LLMs locally on Apple Silicon. The primary
requirements were:

1. **Native Node.js binding** (not subprocess/server)
2. **GPU acceleration** on Apple Silicon
3. **Good model ecosystem** (many available models)
4. **Production-ready stability**
5. **Efficient for real LLM workloads**

## Options Considered

### Option 1: CoreML with Custom Conversion

**Approach**: Convert HuggingFace models to CoreML format using `coremltools`, then run via Swift
with C-bridge to Node.js.

**Pros**:

- Native Apple Neural Engine (ANE) support
- Optimized for Apple hardware
- Can publish converted models to HuggingFace

**Cons**:

- ❌ **Severe memory issues**: Converting Phi-4 (14B) required >100GB RAM, causing OOM crashes even
  on 64GB machines
- ❌ **ANE memory limits**: ANE has ~4GB memory limit, insufficient for most LLMs
- ❌ **Limited model support**: Complex architectures often fail conversion
- ❌ **Time-consuming**: Each model needs manual conversion and testing
- ❌ **Maintenance burden**: Must update conversions for each new model version

**Attempted**: We tried multiple conversion approaches:

- `coremltools` with `torch.jit.trace` - OOM
- `int4` / `int8` quantization - Still OOM
- `float16` precision - Type mismatch errors
- `EMPTY` MIL pipeline optimization skip - Reduced to ~13GB but still impractical

**Result**: ❌ Rejected - CoreML conversion is not viable for real LLMs

### Option 2: MLX (Apple's ML Framework)

**Approach**: Use `mlx-swift` with pre-converted models from `mlx-community` on HuggingFace.

**Pros**:

- ✅ Designed for unified memory (handles large models well)
- ✅ Good model availability on HuggingFace (`mlx-community`)
- ✅ Native Apple optimization

**Cons**:

- ❌ **No native Node.js binding**: MLX Metal shaders require compilation via `xcodebuild`, not
  `swift run`
- ❌ **Subprocess only**: Had to shell out to compiled Swift executable
- ❌ **Metal library loading issues**: MLX searches for `.metallib` relative to executable
  (Node.js), not the framework
- ❌ **Complex build setup**: Requires Xcode project, not just Swift Package Manager

**Attempted**: Built working Swift CLI with MLX. Node.js integration required subprocess calls,
which added latency and complexity.

**Result**: ⚠️ Works, but subprocess approach is suboptimal

### Option 3: llama.cpp via node-llama-cpp ✅

**Approach**: Use `node-llama-cpp`, a mature N-API binding for `llama.cpp`.

**Pros**:

- ✅ **True native binding**: N-API integration, no subprocess
- ✅ **Metal GPU acceleration**: Full Apple Silicon support
- ✅ **Massive model ecosystem**: 1000+ GGUF models available
- ✅ **Battle-tested**: Years of production use
- ✅ **Auto-download**: Models fetched from HuggingFace automatically
- ✅ **Cross-platform**: macOS, Linux, Windows
- ✅ **Active development**: Regular updates and new model support

**Cons**:

- No ANE support (GPU only, but ANE has memory limits anyway)
- GGUF format only (but most models available)

**Result**: ✅ Accepted

## Decision

We chose **llama.cpp via node-llama-cpp** because:

1. It's the only option providing a true native Node.js binding
2. Metal GPU acceleration is sufficient (ANE's 4GB limit makes it unsuitable for LLMs)
3. The GGUF model ecosystem is unmatched
4. Production stability is proven

## Consequences

### Positive

- Simple integration: `npm install node-llama-cpp`
- Automatic model management
- Great performance on Apple Silicon
- Future-proof with active community

### Negative

- Cannot use Apple Neural Engine (but it's unsuitable anyway)
- Dependent on `llama.cpp` architecture support for new models
- GGUF conversion needed for models not yet available

## Notes on ANE vs GPU

A key learning: **Apple Neural Engine is not suitable for LLMs**:

| Aspect       | ANE          | Metal GPU  |
| ------------ | ------------ | ---------- |
| Memory Limit | ~4GB         | System RAM |
| LLM Support  | Very limited | Full       |
| Model Size   | <2B params   | Any        |
| Ecosystem    | Sparse       | Extensive  |

For audio/vision models (like Whisper), ANE is excellent. For LLMs, GPU is the correct choice.
