import { describe, it, expect } from "vitest"
import { LLMEngine } from "./engine"
import { MODELS } from "./types"

describe("LLMEngine", () => {
  describe("constructor", () => {
    it("should accept valid model ID", () => {
      const engine = new LLMEngine({ model: "gemma-3n-e4b" })
      expect(engine).toBeDefined()
    })

    it("should accept model alias", () => {
      const engine = new LLMEngine({ model: "gemma" })
      expect(engine).toBeDefined()
    })

    it("should accept custom GGUF path", () => {
      const engine = new LLMEngine({ model: "/path/to/custom.gguf" })
      expect(engine).toBeDefined()
    })

    it("should accept gpuLayers option", () => {
      const engine = new LLMEngine({ model: "gemma", gpuLayers: 0 })
      expect(engine).toBeDefined()
    })
  })

  describe("resolveModel", () => {
    it("should resolve model ID to model info", () => {
      const engine = new LLMEngine({ model: "phi-4" })
      const info = engine.getModelInfo()
      expect(info.name).toBe("Phi-4 14B")
    })

    it("should resolve alias to model info", () => {
      const engine = new LLMEngine({ model: "qwen" })
      const info = engine.getModelInfo()
      expect(info.name).toBe("Qwen3 8B")
    })
  })

  describe("isAvailable", () => {
    it("should return true (llama.cpp is always available once constructed)", () => {
      const engine = new LLMEngine({ model: "gemma" })
      // Note: isAvailable() returns true because llama.cpp availability is checked at construction
      expect(engine.isAvailable()).toBe(true)
    })
  })
})

describe("Model resolution", () => {
  it("should have gemma alias point to gemma-3n-e4b", () => {
    const engine = new LLMEngine({ model: "gemma" })
    const info = engine.getModelInfo()
    expect(info).toEqual(MODELS["gemma-3n-e4b"])
  })

  it("should have qwen alias point to qwen3-8b", () => {
    const engine = new LLMEngine({ model: "qwen" })
    const info = engine.getModelInfo()
    expect(info).toEqual(MODELS["qwen3-8b"])
  })

  it("should have deepseek alias point to deepseek-r1-7b", () => {
    const engine = new LLMEngine({ model: "deepseek" })
    const info = engine.getModelInfo()
    expect(info).toEqual(MODELS["deepseek-r1-7b"])
  })
})
