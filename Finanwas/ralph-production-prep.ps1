# Ralph Production Prep - Remove mock data and ensure empty states
# Usage: .\ralph-production-prep.ps1 [-MaxIterations 10]

param(
    [int]$MaxIterations = 10
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PromptFile = Join-Path $ScriptDir "prompt-production-prep.md"
$ProgressFile = Join-Path $ScriptDir "production-prep-progress.txt"

# Check for required tools
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "Claude Code CLI not found. Install it from https://claude.com/claude-code"
    exit 1
}

if (-not (Test-Path $PromptFile)) {
    Write-Error "Prompt file not found at $PromptFile"
    exit 1
}

# Initialize progress file
if (-not (Test-Path $ProgressFile)) {
    @"
# Production Preparation Progress Log
Started: $(Get-Date)
Mission: Remove all mock data, ensure perfect empty states
---
"@ | Set-Content $ProgressFile
}

Write-Host ""
Write-Host "======================================================="
Write-Host "  Ralph Production Prep - Removing Mock Data"
Write-Host "======================================================="
Write-Host "Max iterations: $MaxIterations"
Write-Host "Prompt: $PromptFile"
Write-Host "Progress: $ProgressFile"
Write-Host ""

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host ""
    Write-Host "======================================================="
    Write-Host "  Production Prep Iteration $i of $MaxIterations"
    Write-Host "======================================================="
    Write-Host ""

    # Read the prompt
    $Prompt = Get-Content $PromptFile -Raw

    # Add iteration context
    $FullPrompt = @"
$Prompt

## Current Iteration: $i of $MaxIterations

## File Locations
- Progress file: $ProgressFile
- Script directory: $ScriptDir

Focus on Priority 1 (Dashboard) first, then work through priorities 2-5.
Document all changes in $ProgressFile.

Continue removing mock data and implementing empty states.
"@

    # Run Claude Code
    try {
        $Output = ""
        claude -p $FullPrompt --dangerously-skip-permissions 2>&1 | ForEach-Object {
            Write-Host $_
            $Output += $_ + "`n"
        }
    }
    catch {
        Write-Host "Claude iteration ended with error: $_"
    }

    # Check for completion signal
    if ($Output -match "PRODUCTION PREP COMPLETE" -or $Output -match "No more mock data found") {
        Write-Host ""
        Write-Host "======================================================="
        Write-Host "  Production prep completed!"
        Write-Host "  Finished at iteration $i of $MaxIterations"
        Write-Host "======================================================="
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "1. Create test user account"
        Write-Host "2. Verify all empty states work correctly"
        Write-Host "3. Check that no mock data appears"
        Write-Host "4. Deploy to production!"
        exit 0
    }

    Write-Host ""
    Write-Host "Iteration $i complete. Continuing..."
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "======================================================="
Write-Host "  Production prep reached max iterations ($MaxIterations)"
Write-Host "  Check $ProgressFile for status."
Write-Host "======================================================="

exit 0
