import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { LLMEngine } from "./engine"
import { MODELS } from "./types"

// Mock node-llama-cpp
vi.mock("node-llama-cpp", () => {
  const mockSequence = {}

  const mockContext = {
    getSequence: vi.fn().mockReturnValue(mockSequence),
    dispose: vi.fn().mockResolvedValue(undefined)
  }

  const mockModel = {
    createContext: vi.fn().mockResolvedValue(mockContext),
    dispose: vi.fn().mockResolvedValue(undefined)
  }

  const mockLlama = {
    loadModel: vi.fn().mockResolvedValue(mockModel)
  }

  // Must be a real class for `new` to work
  class MockLlamaChatSession {
    prompt = vi.fn().mockResolvedValue("Mock response")
    setChatHistory = vi.fn()
  }

  return {
    getLlama: vi.fn().mockResolvedValue(mockLlama),
    resolveModelFile: vi.fn().mockResolvedValue("/mock/path/to/model.gguf"),
    LlamaChatSession: MockLlamaChatSession
  }
})

describe("LLMEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.log during tests
    vi.spyOn(console, "log").mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("constructor", () => {
    it("should accept valid model ID", () => {
      const engine = new LLMEngine({ model: "gemma-3n-e4b" })
      expect(engine).toBeDefined()
    })

    it("should accept model alias", () => {
      const engine = new LLMEngine({ model: "gemma" })
      expect(engine).toBeDefined()
    })

    it("should accept uppercase model alias", () => {
      const engine = new LLMEngine({ model: "GEMMA" })
      expect(engine).toBeDefined()
      expect(engine.getModelInfo().name).toBe(MODELS["gemma-3n-e4b"].name)
    })

    it("should accept custom GGUF path", () => {
      const engine = new LLMEngine({ model: "/path/to/custom.gguf" })
      expect(engine).toBeDefined()
    })

    it("should accept gpuLayers option", () => {
      const engine = new LLMEngine({ model: "gemma", gpuLayers: 0 })
      expect(engine).toBeDefined()
    })

    it("should accept contextSize option", () => {
      const engine = new LLMEngine({ model: "gemma", contextSize: 8192 })
      expect(engine).toBeDefined()
    })

    it("should accept huggingFaceToken option", () => {
      const engine = new LLMEngine({
        model: "gemma",
        huggingFaceToken: "hf_test_token"
      })
      expect(engine).toBeDefined()
    })

    it("should use HF_TOKEN from environment", () => {
      const originalToken = process.env.HF_TOKEN
      process.env.HF_TOKEN = "hf_env_token"

      const engine = new LLMEngine({ model: "gemma" })
      expect(engine).toBeDefined()

      process.env.HF_TOKEN = originalToken
    })
  })

  describe("getModelInfo", () => {
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

    it("should return custom model info for unknown models", () => {
      const engine = new LLMEngine({ model: "/custom/model.gguf" })
      const info = engine.getModelInfo()
      expect(info.name).toBe("/custom/model.gguf")
      expect(info.repo).toBe("custom")
      expect(info.description).toBe("Custom model")
    })
  })

  describe("isAvailable", () => {
    it("should return true (llama.cpp is always available once constructed)", () => {
      const engine = new LLMEngine({ model: "gemma" })
      expect(engine.isAvailable()).toBe(true)
    })
  })

  describe("initialize", () => {
    it("should load model successfully", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      await engine.initialize()
      // Should not throw
    })

    it("should be idempotent (calling twice does nothing)", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      await engine.initialize()
      await engine.initialize() // Should not throw or reload
    })

    it("should work with custom model path", async () => {
      const engine = new LLMEngine({ model: "/custom/model.gguf" })
      await engine.initialize()
    })

    it("should work with contextSize option", async () => {
      const engine = new LLMEngine({ model: "gemma", contextSize: 4096 })
      await engine.initialize()
    })
  })

  describe("generate", () => {
    it("should generate text from prompt", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.generate({ prompt: "Hello" })

      expect(result.text).toBe("Mock response")
      expect(result.model).toContain("gemma")
      expect(result.finishReason).toBe("stop")
      expect(result.durationSeconds).toBeGreaterThanOrEqual(0)
    })

    it("should auto-initialize if not initialized", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      // Don't call initialize()
      const result = await engine.generate({ prompt: "Hello" })
      expect(result.text).toBe("Mock response")
    })

    it("should accept all generation options", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.generate({
        prompt: "Hello",
        systemPrompt: "You are helpful",
        maxTokens: 100,
        temperature: 0.5,
        topP: 0.8,
        topK: 30,
        repeatPenalty: 1.2
      })

      expect(result.text).toBe("Mock response")
    })
  })

  describe("generateStreaming", () => {
    it("should stream tokens", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const tokens: string[] = []

      const result = await engine.generateStreaming({ prompt: "Hello" }, (token) => {
        tokens.push(token)
      })

      expect(result.text).toBe("Mock response")
      expect(result.finishReason).toBe("stop")
    })

    it("should auto-initialize if not initialized", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.generateStreaming({ prompt: "Hello" }, vi.fn())
      expect(result.text).toBe("Mock response")
    })

    it("should handle systemPrompt in streaming", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.generateStreaming(
        {
          prompt: "Hello",
          systemPrompt: "Be concise"
        },
        vi.fn()
      )

      expect(result.text).toBe("Mock response")
    })
  })

  describe("chat", () => {
    it("should handle chat messages", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.chat([
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" }
      ])

      expect(result.text).toBe("Mock response")
    })

    it("should handle assistant messages in history", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.chat([
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello!" },
        { role: "user", content: "How are you?" }
      ])

      expect(result.text).toBe("Mock response")
    })

    it("should throw if last message is not from user", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      await expect(
        engine.chat([
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi!" }
        ])
      ).rejects.toThrow("Last message must be from user")
    })

    it("should accept generation options", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.chat([{ role: "user", content: "Hello" }], {
        maxTokens: 50,
        temperature: 0.3
      })

      expect(result.text).toBe("Mock response")
    })

    it("should auto-initialize if not initialized", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      const result = await engine.chat([{ role: "user", content: "Hello" }])
      expect(result.text).toBe("Mock response")
    })
  })

  describe("resetSession", () => {
    it("should reset session after initialization", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      await engine.initialize()
      engine.resetSession() // Should not throw
    })

    it("should be safe to call before initialization", () => {
      const engine = new LLMEngine({ model: "gemma" })
      engine.resetSession() // Should not throw
    })
  })

  describe("dispose", () => {
    it("should clean up resources", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      await engine.initialize()
      await engine.dispose()
    })

    it("should be safe to call before initialization", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      await engine.dispose() // Should not throw
    })

    it("should be safe to call multiple times", async () => {
      const engine = new LLMEngine({ model: "gemma" })
      await engine.initialize()
      await engine.dispose()
      await engine.dispose() // Should not throw
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

  it("should have phi alias point to phi-4", () => {
    const engine = new LLMEngine({ model: "phi" })
    const info = engine.getModelInfo()
    expect(info).toEqual(MODELS["phi-4"])
  })

  it("should have minimax alias point to minimax-m2.1", () => {
    const engine = new LLMEngine({ model: "minimax" })
    const info = engine.getModelInfo()
    expect(info).toEqual(MODELS["minimax-m2.1"])
  })
})
