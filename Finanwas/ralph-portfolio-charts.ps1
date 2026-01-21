# Ralph Agent - Portfolio Performance Charts
# This script runs Ralph to implement portfolio performance tracking with charts

param(
    [int]$MaxIterations = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Portfolio Performance Charts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Add portfolio performance charts" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-portfolio-charts.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, building a new feature. Follow these rules:

Loop Control:
* Max 5 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\portfolio-charts-progress.txt
* Include: iteration number, what you built, what's next
* Stop when feature is complete and tested

Progress Tracking:
At the end of each iteration, write to portfolio-charts-progress.txt:
Iteration X complete
[What was built]
[Test results]
[Next iteration plan or DONE if complete]

When to stop:
* Database migration created
* Snapshot API endpoint works
* Performance query functions implemented
* Chart component displays data
* Integrated into portfolio page
* Documentation created
* OR max iterations reached

Implementation priority (follow this order):
1. Iteration 1: Database migration + types
2. Iteration 2: API endpoint for snapshot creation + query functions
3. Iteration 3: Install recharts + basic chart component
4. Iteration 4: Add to portfolio page + time period selector
5. Iteration 5: Polish, metrics, documentation

Focus on working MVP first - manual snapshots + basic line chart.
Advanced features (automatic snapshots, benchmarks) can come later.

Start iteration 1 now. Create the database migration and types.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: Feature build complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\portfolio-charts-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 15
        Write-Host ""
    }

    Write-Host "Test: Visit /portfolio and check for performance chart" -ForegroundColor Yellow
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
