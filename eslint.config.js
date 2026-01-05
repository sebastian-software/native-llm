import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier"

export default tseslint.config(
  // Ignores
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts"]
  },

  // Base ESLint rules
  eslint.configs.recommended,

  // TypeScript strict + stylistic
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // TypeScript parser options
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  // Custom rules
  {
    rules: {
      // Allow unused vars starting with _
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],

      // Allow explicit any in some cases (we use it sparingly)
      "@typescript-eslint/no-explicit-any": "warn",

      // Disable some strict rules that are too noisy
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-confusing-void-expression": "off"
    }
  },

  // Prettier (must be last)
  prettier
)
