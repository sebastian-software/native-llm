import { describe, it, expect } from "vitest"
import { MODELS, MODEL_ALIASES, RECOMMENDED_MODELS } from "./types"

describe("MODELS", () => {
  it("should have required fields for all models", () => {
    for (const [id, model] of Object.entries(MODELS)) {
      expect(model.name, `${id} missing name`).toBeDefined()
      expect(model.repo, `${id} missing repo`).toBeDefined()
      expect(model.file, `${id} missing file`).toBeDefined()
      expect(model.parameters, `${id} missing parameters`).toBeDefined()
      expect(model.quantization, `${id} missing quantization`).toBeDefined()
      expect(model.contextLength, `${id} missing contextLength`).toBeGreaterThan(0)
      expect(model.languages, `${id} missing languages`).toBeInstanceOf(Array)
      expect(model.description, `${id} missing description`).toBeDefined()
    }
  })

  it("should have benchmarks for all models", () => {
    for (const [id, model] of Object.entries(MODELS)) {
      expect(model.benchmarks, `${id} missing benchmarks`).toBeDefined()
      expect(model.benchmarks.mmlu, `${id} missing mmlu benchmark`).toBeGreaterThan(0)
    }
  })

  it("should have valid GGUF file extensions", () => {
    for (const [id, model] of Object.entries(MODELS)) {
      expect(model.file, `${id} should have .gguf extension`).toMatch(/\.gguf$/)
    }
  })

  it("should have Q4_K_M quantization for all models", () => {
    for (const [id, model] of Object.entries(MODELS)) {
      expect(model.quantization, `${id} should use Q4_K_M`).toBe("Q4_K_M")
    }
  })
})

describe("MODEL_ALIASES", () => {
  it("should point to valid model IDs", () => {
    const modelIds = Object.keys(MODELS)
    for (const [alias, modelId] of Object.entries(MODEL_ALIASES)) {
      expect(modelIds, `Alias '${alias}' points to invalid model '${modelId}'`).toContain(modelId)
    }
  })

  it("should have common aliases", () => {
    expect(MODEL_ALIASES.gemma).toBeDefined()
    expect(MODEL_ALIASES.qwen).toBeDefined()
    expect(MODEL_ALIASES.phi).toBeDefined()
    expect(MODEL_ALIASES.deepseek).toBeDefined()
  })
})

describe("RECOMMENDED_MODELS", () => {
  it("should point to valid model IDs", () => {
    const modelIds = Object.keys(MODELS)
    for (const [useCase, modelId] of Object.entries(RECOMMENDED_MODELS)) {
      expect(
        modelIds,
        `Recommendation '${useCase}' points to invalid model '${modelId}'`
      ).toContain(modelId)
    }
  })

  it("should have key recommendations", () => {
    expect(RECOMMENDED_MODELS.fast).toBeDefined()
    expect(RECOMMENDED_MODELS.balanced).toBeDefined()
    expect(RECOMMENDED_MODELS.quality).toBeDefined()
    expect(RECOMMENDED_MODELS.code).toBeDefined()
    expect(RECOMMENDED_MODELS.reasoning).toBeDefined()
  })
})
