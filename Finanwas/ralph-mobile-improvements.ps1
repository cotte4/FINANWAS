# Ralph Agent - Mobile-First Improvements
# This script runs Ralph to add mobile gestures and optimizations

param(
    [int]$MaxIterations = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Mobile-First Improvements" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Add mobile gestures and optimizations" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-mobile-improvements.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, building mobile UX improvements. Follow these rules:

Loop Control:
* Max 5 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\mobile-improvements-progress.txt
* Include: iteration number, features added, test results
* Stop when core mobile features are implemented

Progress Tracking:
At the end of each iteration, write to mobile-improvements-progress.txt:
Iteration X complete
[Features implemented]
[Components created]
[Next steps or DONE]

When to stop:
* Swipe to delete working on key components
* Pull to refresh implemented
* Mobile layouts optimized
* Touch targets sized properly
* Documentation created
* OR max iterations reached

Implementation priority:
1. Iteration 1: Install libraries + swipe-to-delete for assets
2. Iteration 2: Pull-to-refresh on portfolio
3. Iteration 3: Mobile bottom nav (optional) + layout optimizations
4. Iteration 4: Additional swipe-to-delete (goals, notes)
5. Iteration 5: Polish, test, document

Focus:
* Smooth 60fps animations
* Native mobile feel
* Don't break desktop experience

Start iteration 1 now. Install react-swipeable and create swipe-to-delete.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: Mobile improvements complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\mobile-improvements-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 15
        Write-Host ""
    }

    Write-Host "Test: Open app on mobile device and test swipe gestures" -ForegroundColor Yellow
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
