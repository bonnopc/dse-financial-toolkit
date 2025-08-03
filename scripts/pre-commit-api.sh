#!/bin/bash

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/dse-api"

echo "🔍 Running API lint check..."
echo "API Directory: $API_DIR"

if [ ! -d "$API_DIR" ]; then
    echo "❌ API directory not found at: $API_DIR"
    exit 1
fi

cd "$API_DIR" && bun run lint
LINT_EXIT_CODE=$?

echo "🧪 Running API tests..."
cd "$API_DIR" && bun run test --bail
TEST_EXIT_CODE=$?

echo "Lint exit code: $LINT_EXIT_CODE"
echo "Test exit code: $TEST_EXIT_CODE"

if [ $LINT_EXIT_CODE -ne 0 ] || [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "❌ Pre-commit checks failed!"
    exit 1
fi

echo "✅ All checks passed!"
exit 0
