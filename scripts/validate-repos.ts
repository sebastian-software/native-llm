#!/usr/bin/env tsx
/**
 * Validate that all model repos exist on HuggingFace
 * Run: pnpm tsx scripts/validate-repos.ts
 */

import { MODELS, type ModelId } from "../src/index.js"

interface ValidationResult {
  model: string
  repo: string
  file: string
  exists: boolean
  error?: string
  experimental?: boolean
}

async function checkRepo(modelId: ModelId): Promise<ValidationResult> {
  const model = MODELS[modelId]
  const url = `https://huggingface.co/${model.repo}/resolve/main/${model.file}`

  try {
    const response = await fetch(url, { method: "HEAD" })
    return {
      model: modelId,
      repo: model.repo,
      file: model.file,
      exists: response.ok,
      experimental: (model as any).experimental,
      error: response.ok ? undefined : `HTTP ${response.status}`
    }
  } catch (error) {
    return {
      model: modelId,
      repo: model.repo,
      file: model.file,
      exists: false,
      experimental: (model as any).experimental,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

async function main() {
  console.log("🔍 Validating model repositories...\n")

  const modelIds = Object.keys(MODELS) as ModelId[]
  const results: ValidationResult[] = []

  for (const modelId of modelIds) {
    process.stdout.write(`Checking ${modelId}... `)
    const result = await checkRepo(modelId)
    results.push(result)

    if (result.exists) {
      console.log("✅")
    } else if (result.experimental) {
      console.log(`⚠️  (experimental) ${result.error}`)
    } else {
      console.log(`❌ ${result.error}`)
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("Summary:")

  const valid = results.filter((r) => r.exists)
  const invalid = results.filter((r) => !r.exists && !r.experimental)
  const experimental = results.filter((r) => !r.exists && r.experimental)

  console.log(`✅ Valid: ${valid.length}`)
  console.log(`⚠️  Experimental (pending): ${experimental.length}`)
  console.log(`❌ Invalid: ${invalid.length}`)

  if (invalid.length > 0) {
    console.log("\n❌ Invalid repos that need fixing:")
    for (const r of invalid) {
      console.log(`   - ${r.model}: ${r.repo}`)
    }
  }

  if (experimental.length > 0) {
    console.log("\n⚠️  Experimental repos (GGUF may not exist yet):")
    for (const r of experimental) {
      console.log(`   - ${r.model}: ${r.repo}`)
    }
  }

  // Exit with error if there are invalid non-experimental repos
  if (invalid.length > 0) {
    process.exit(1)
  }
}

main()
