# Ralph Agent - Portfolio Health Score
# This script runs Ralph to implement algorithmic portfolio health rating

param(
    [int]$MaxIterations = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Portfolio Health Score" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Add portfolio health score" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-portfolio-health-score.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, building a new feature. Follow these rules:

Loop Control:
* Max 5 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\portfolio-health-score-progress.txt
* Include: iteration number, what you built, test results
* Stop when feature is complete

Progress Tracking:
At the end of each iteration, write to portfolio-health-score-progress.txt:
Iteration X complete
[Algorithm/component built]
[Test results with sample portfolios]
[Next steps or DONE]

When to stop:
* Health score algorithm implemented with all 4 components
* API endpoint returns correct scores
* HealthScoreCard component displays score
* Recommendations generated
* Integrated into portfolio page
* Documentation created
* OR max iterations reached

Implementation priority:
1. Iteration 1: Core algorithm (portfolio-health.ts)
2. Iteration 2: API endpoint + test calculations
3. Iteration 3: HealthScoreCard UI component
4. Iteration 4: Recommendations engine
5. Iteration 5: Integration + documentation

Focus:
* Algorithm should be transparent and explainable
* Recommendations must be actionable
* Test with various portfolio scenarios

Start iteration 1 now. Create the health score algorithm.
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
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\portfolio-health-score-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 15
        Write-Host ""
    }

    Write-Host "Test: Visit /portfolio and check health score card" -ForegroundColor Yellow
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
