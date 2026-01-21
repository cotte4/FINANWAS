# Ralph Agent - Fix Search Empresa
# This script runs Ralph to fix the search empresa functionality

param(
    [int]$MaxIterations = 3
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Fix Search Empresa" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Fix search empresa functionality" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-fix-search-empresa.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, fixing a critical bug. Follow these rules:

Loop Control:
* Max 3 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\fix-search-empresa-progress.txt
* Include: iteration number, what you fixed, what's next
* Stop when bug is fixed and tested

Progress Tracking:
At the end of each iteration, write to fix-search-empresa-progress.txt:
Iteration X complete
[Changes made]
[Test results]
[Next steps or DONE if complete]

When to stop:
* API endpoint path is consistent
* Search works with valid tickers
* Error handling shows user-friendly messages
* No console errors
* OR max iterations reached

Implementation priority:
1. Fix endpoint path consistency first
2. Test with valid ticker (AAPL)
3. Improve error handling
4. Test edge cases

Start iteration 1 now. Fix the search empresa bug.
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
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\fix-search-empresa-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 10
        Write-Host ""
    }

    Write-Host "Test: Visit /investigar/scorecard and search for AAPL" -ForegroundColor Yellow
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
