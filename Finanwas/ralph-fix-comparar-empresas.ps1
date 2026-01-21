# Ralph Agent - Fix Comparar Empresas
# This script runs Ralph to fix the comparar empresas functionality

param(
    [int]$MaxIterations = 3
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Fix Comparar Empresas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Fix comparar empresas functionality" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-fix-comparar-empresas.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, fixing a critical bug. Follow these rules:

Loop Control:
* Max 3 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\fix-comparar-empresas-progress.txt
* Include: iteration number, what you fixed, test results
* Stop when bug is fixed and tested

Progress Tracking:
At the end of each iteration, write to fix-comparar-empresas-progress.txt:
Iteration X complete
[Changes made]
[Test results - what worked, what didn't]
[Next steps or DONE if complete]

When to stop:
* Comparar works with valid tickers
* Graceful degradation handles partial failures
* Error messages are specific and helpful
* Retry logic works
* No console errors
* OR max iterations reached

Implementation priority:
1. Fix error handling (most critical)
2. Add graceful degradation
3. Implement retry logic
4. Test with valid + invalid tickers

Start iteration 1 now. Fix the comparar empresas bug.
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
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\fix-comparar-empresas-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 10
        Write-Host ""
    }

    Write-Host "Test: Visit /investigar/comparar and add AAPL, MSFT, and an invalid ticker" -ForegroundColor Yellow
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
