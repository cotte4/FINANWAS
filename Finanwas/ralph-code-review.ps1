# Ralph Code Review - Optimization and bug fixing loop
# Usage: .\ralph-code-review.ps1 [-MaxIterations 15]

param(
    [int]$MaxIterations = 15
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PromptFile = Join-Path $ScriptDir "prompt-code-review.md"
$ProgressFile = Join-Path $ScriptDir "code-review-progress.txt"
$FeaturesFile = Join-Path $ScriptDir "features_future.md"

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
# Code Review Progress Log
Started: $(Get-Date)
---
"@ | Set-Content $ProgressFile
}

# Initialize features file if it doesn't exist
if (-not (Test-Path $FeaturesFile)) {
    @"
# Future Feature Ideas for Finanwas

Last Updated: $(Get-Date -Format "yyyy-MM-dd")

---

## UX Improvements

## Advanced Features

## Integrations

## Performance Enhancements

## Analytics & Monitoring

## User Engagement
"@ | Set-Content $FeaturesFile
}

Write-Host ""
Write-Host "Starting Ralph Code Review - Max iterations: $MaxIterations"
Write-Host "Prompt: $PromptFile"
Write-Host "Progress: $ProgressFile"
Write-Host "Features: $FeaturesFile"
Write-Host ""

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host ""
    Write-Host "======================================================="
    Write-Host "  Code Review Iteration $i of $MaxIterations"
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
- Features file: $FeaturesFile
- Script directory: $ScriptDir

Focus on high-impact items. Document progress in $ProgressFile.
If you find features to propose, append them to $FeaturesFile.

Continue working on optimizations and fixes.
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
    if ($Output -match "CODE REVIEW COMPLETE" -or $Output -match "No more optimizations found") {
        Write-Host ""
        Write-Host "======================================================="
        Write-Host "  Code Review completed!"
        Write-Host "  Finished at iteration $i of $MaxIterations"
        Write-Host "======================================================="
        exit 0
    }

    Write-Host ""
    Write-Host "Iteration $i complete. Continuing..."
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "======================================================="
Write-Host "  Code Review reached max iterations ($MaxIterations)"
Write-Host "  Check $ProgressFile for status."
Write-Host "  Check $FeaturesFile for feature proposals."
Write-Host "======================================================="

exit 0
