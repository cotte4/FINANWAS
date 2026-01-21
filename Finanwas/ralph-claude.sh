#!/bin/bash
# Ralph for Claude Code - Long-running AI agent loop
# Usage: ./ralph-claude.sh [max_iterations]
# Adapted from the original Ralph pattern for use with Claude Code CLI

set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"
PROMPT_FILE="$SCRIPT_DIR/prompt-claude.md"

# Check for required tools
if ! command -v claude &> /dev/null; then
  echo "Error: Claude Code CLI not found. Install it from https://claude.com/claude-code"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: jq not found. Install with: winget install jqlang.jq"
  exit 1
fi

if [ ! -f "$PRD_FILE" ]; then
  echo "Error: prd.json not found at $PRD_FILE"
  echo "Create a prd.json file with your user stories first."
  echo "See prd.json.example for the expected format."
  exit 1
fi

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")

  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    # Archive the previous run
    DATE=$(date +%Y-%m-%d)
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo "   Archived to: $ARCHIVE_FOLDER"

    # Reset progress file for new run
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_BRANCH" ]; then
    echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
  fi
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

echo "Starting Ralph (Claude Code) - Max iterations: $MAX_ITERATIONS"
echo "PRD: $PRD_FILE"
echo "Progress: $PROGRESS_FILE"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "  Ralph Iteration $i of $MAX_ITERATIONS"
  echo "═══════════════════════════════════════════════════════"

  # Check if all stories are already complete before running
  INCOMPLETE=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_FILE")
  if [ "$INCOMPLETE" -eq 0 ]; then
    echo ""
    echo "All stories already complete!"
    exit 0
  fi

  echo "Remaining stories: $INCOMPLETE"
  echo ""

  # Read the prompt and run Claude Code
  # Using --dangerously-skip-permissions for autonomous operation
  # Using --print for non-interactive output
  PROMPT=$(cat "$PROMPT_FILE")

  # Add context about file locations
  FULL_PROMPT="$PROMPT

## File Locations (for this run)
- PRD file: $PRD_FILE
- Progress file: $PROGRESS_FILE
- Script directory: $SCRIPT_DIR

Begin working on the next incomplete user story now."

  OUTPUT=$(claude -p "$FULL_PROMPT" --dangerously-skip-permissions 2>&1 | tee /dev/stderr) || true

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  Ralph completed all tasks!"
    echo "  Finished at iteration $i of $MAX_ITERATIONS"
    echo "═══════════════════════════════════════════════════════"
    exit 0
  fi

  echo ""
  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Ralph reached max iterations ($MAX_ITERATIONS)"
echo "  without completing all tasks."
echo "  Check $PROGRESS_FILE for status."
echo "═══════════════════════════════════════════════════════"

# Show remaining stories
echo ""
echo "Remaining incomplete stories:"
jq -r '.userStories[] | select(.passes == false) | "  - \(.id): \(.title)"' "$PRD_FILE"

exit 1
