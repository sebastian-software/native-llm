# Contributing to native-llm

Thank you for your interest in contributing! This document provides guidelines for contributing to
the project.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/sebastian-software/native-llm.git
cd native-llm

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test
```

## Code Style

This project uses:

- **ESLint** with TypeScript strict rules
- **Prettier** for formatting
- **Husky** for git hooks

Code is automatically formatted on commit via lint-staged.

```bash
# Check formatting
pnpm format:check

# Fix formatting
pnpm format

# Run linter
pnpm lint

# Fix lint issues
pnpm lint:fix
```

## Pull Request Process

1. Fork the repository and create your branch from `main`
2. Make your changes and add tests if applicable
3. Ensure all tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Update documentation if needed
6. Submit a pull request

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `test:` Test additions/changes
- `refactor:` Code refactoring

## Adding New Models

To add a new model:

1. Add the model definition to `src/types.ts` in the `MODELS` object
2. Include all required fields (name, repo, file, parameters, etc.)
3. Add benchmark scores (mmlu, arena at minimum)
4. Add an alias if appropriate
5. Update the README model table
6. Test with `pnpm tsx scripts/test-model.ts <model-id>`

## Questions?

Feel free to open an issue for any questions or suggestions.
