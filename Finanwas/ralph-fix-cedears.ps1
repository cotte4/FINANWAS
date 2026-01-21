# Ralph Agent - Fix CEDEARS Not Appearing
# This script runs Ralph to fix the CEDEARS visibility bug

param(
    [int]$MaxIterations = 2
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Fix CEDEARS Not Appearing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Fix CEDEARS not appearing in asset dropdown" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-fix-cedears.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, fixing a simple but critical bug. Follow these rules:

Loop Control:
* Max 2 iterations (this is a straightforward fix)
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\fix-cedears-progress.txt
* Include: iteration number, what you fixed, test results
* Stop when bug is fixed and tested

Progress Tracking:
At the end of each iteration, write to fix-cedears-progress.txt:
Iteration X complete
[Files changed]
[What was fixed]
[Test results]
[DONE or next steps]

When to stop:
* AddAssetModal imports from centralized constants
* EditAssetModal also uses centralized constants (if applicable)
* CEDEAR appears in dropdown
* Can successfully create CEDEAR asset
* No console or TypeScript errors
* OR max iterations reached

Implementation priority:
1. Iteration 1: Fix AddAssetModal (and EditAssetModal if needed)
2. Iteration 2: Test, verify, commit

This should be a quick fix - just remove hardcoded array and import from constants.

Start iteration 1 now. Fix the CEDEARS bug.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: Bug fix complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\fix-cedears-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 10
        Write-Host ""
    }

    Write-Host "Test: Open portfolio, click 'Agregar Activo', check for CEDEAR option" -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "Error running Ralph agent: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Return to original directory
    Set-Location $OriginalDir
}
