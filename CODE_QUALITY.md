# Code Quality Setup

This project uses **Prettier**, **lint-staged**, and **Husky** to maintain consistent code quality across all sub-projects.

## What's Configured

### 🎨 Prettier

- Automatic code formatting for JavaScript, TypeScript, JSON, Markdown, and YAML files
- Configuration in `.prettierrc`
- Ignored files listed in `.prettierignore`

### 🔧 Lint-staged

- Runs before each Git commit
- Formats staged files with Prettier
- Runs project-specific linting for API and Next.js projects
- Configuration in `package.json` under `lint-staged`

### 🪝 Husky

- Git hooks management
- Pre-commit hook runs lint-staged automatically
- Configuration in `.husky/` directory

## Available Scripts

### Root Level Commands

```bash
# Format all files
bun run format

# Check formatting without making changes
bun run format:check

# Run tests across all projects
bun run test:all

# Build all projects
bun run build:all
```

### Project-Specific Commands

```bash
# DSE API
bun run api:dev        # Start development server
bun run api:build      # Build the API
bun run api:test       # Run unit tests
bun run api:test:e2e   # Run end-to-end tests
bun run api:lint       # Run ESLint

# Next.js Frontend
bun run nextjs:dev     # Start development server
bun run nextjs:build   # Build the frontend
bun run nextjs:lint    # Run Next.js linting

# DSE Scraper
bun run scraper:dev    # Start development server
bun run scraper:build  # Build the scraper
bun run scraper:scrape # Run scraping
```

## How It Works

### Pre-commit Process

1. You stage files with `git add`
2. You run `git commit`
3. **Husky** intercepts the commit
4. **lint-staged** runs on staged files:
   - Formats code with **Prettier** and checks formatting
   - Runs ESLint on API files with auto-fix
   - Runs full test suite for API when API files change
   - Runs type-checking for Next.js when frontend files change
   - Runs build for scraper when scraper files change
5. If **any step fails**, the commit is blocked
6. If everything passes, the commit proceeds

### Manual Formatting

```bash
# Format all files in the project
bun run format

# Format specific files
bunx prettier --write "path/to/files/**/*.{js,ts,json}"
```

### Manual Linting

```bash
# Lint specific projects
bun run api:lint
bun run nextjs:lint
```

## Configuration Files

- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to exclude from formatting
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - lint-staged configuration and scripts

## Troubleshooting

### Pre-commit Hook Not Running

1. Ensure Husky is installed: `bunx husky install`
2. Check hook permissions: `chmod +x .husky/pre-commit`
3. Verify Git hooks are enabled in your repository

### Formatting Issues

1. Check your file is not in `.prettierignore`
2. Run `bun run format:check` to see what needs formatting
3. Run `bun run format` to fix formatting issues

### Lint Errors

1. Check specific project linting: `bun run api:lint` or `bun run nextjs:lint`
2. Many lint errors can be auto-fixed with the `--fix` flag
3. Review ESLint configuration in individual projects

## Benefits

✅ **Consistent Code Style** - All code follows the same formatting rules  
✅ **Automatic Quality Checks** - Linting and testing before commits  
✅ **Team Collaboration** - No more formatting debates or style inconsistencies  
✅ **Error Prevention** - Catch issues before they reach the repository  
✅ **Time Saving** - Automatic formatting eliminates manual formatting tasks
