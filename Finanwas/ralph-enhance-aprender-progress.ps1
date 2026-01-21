# Ralph Agent - Enhance Aprender Progress
# This script runs Ralph to enhance the learning progress tracking system

param(
    [int]$MaxIterations = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Enhance Aprender Progress" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Enhance learning progress tracking" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-enhance-aprender-progress.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, enhancing a feature. Follow these rules:

Loop Control:
* Max 5 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\enhance-aprender-progress.txt
* Include: iteration number, what you built, what's next
* Stop when core features are implemented and tested

Progress Tracking:
At the end of each iteration, write to enhance-aprender-progress.txt:
Iteration X complete
[Features implemented]
[What works]
[Next iteration plan or DONE if complete]

When to stop:
* Database migration created
* Time tracking works on lesson pages
* Stats dashboard displays metrics
* No performance issues
* Documentation created
* OR max iterations reached

Implementation priority (follow this order):
1. Iteration 1: Database migration + types
2. Iteration 2: Backend query functions + API endpoints
3. Iteration 3: Frontend time tracking on lesson page
4. Iteration 4: Statistics dashboard component
5. Iteration 5: Polish, test, document

Focus:
* Start with Phase 1 (time tracking) - this is most important
* Phase 2 (stats dashboard) is secondary
* Phase 3 (gamification) is optional - only if time permits

Start iteration 1 now. Create the database migration and update types.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: Enhancement complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\enhance-aprender-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 15
        Write-Host ""
    }

    Write-Host "Note: You'll need to run the database migration" -ForegroundColor Yellow
    Write-Host "Test: Visit /aprender and check a lesson for time tracking" -ForegroundColor Yellow
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
