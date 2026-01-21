# Ralph Agent - User Analytics Dashboard
# This script runs Ralph to implement PostHog analytics

param(
    [int]$MaxIterations = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: User Analytics Dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Implement user analytics with PostHog" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-user-analytics.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, implementing analytics. Follow these rules:

Loop Control:
* Max 5 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\user-analytics-progress.txt
* Include: iteration number, events tracked, integration points
* Stop when core analytics implemented

Progress Tracking:
At the end of each iteration, write to user-analytics-progress.txt:
Iteration X complete
[PostHog setup status]
[Events being tracked]
[Next steps or DONE]

When to stop:
* PostHog installed and initialized
* Key events tracked (auth, portfolio, goals, learning)
* User identification working
* Cookie consent implemented
* Privacy compliant
* Documentation created
* OR max iterations reached

Implementation priority:
1. Iteration 1: Install PostHog + create provider
2. Iteration 2: Add event tracking to auth and portfolio
3. Iteration 3: Track goals and learning events
4. Iteration 4: Cookie consent banner
5. Iteration 5: Admin analytics page + documentation

Important:
* NEVER track passwords or sensitive data
* Async tracking (non-blocking)
* Respect user consent

Start iteration 1 now. Install PostHog and create provider.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: Analytics implementation complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\user-analytics-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 15
        Write-Host ""
    }

    Write-Host "Note: Remember to set NEXT_PUBLIC_POSTHOG_KEY in .env.local" -ForegroundColor Yellow
    Write-Host "Test: Check PostHog dashboard for events" -ForegroundColor Yellow
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
