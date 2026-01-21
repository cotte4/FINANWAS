# Ralph Agent - Create Investigar Landing Page
# This script runs the autonomous Ralph agent to create the investigar landing page

param(
    [int]$MaxIterations = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Investigar Landing Page Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Create /investigar landing page" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-investigar-landing.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, an autonomous agent. Follow these rules:

Loop Control:
* You will iterate up to 5 times max
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\investigar-landing-progress.txt
* Include: iteration number, what you did, what's next
* Stop when page is complete and polished

Progress Tracking:
At the end of each iteration, write to investigar-landing-progress.txt:
Iteration X complete. Continuing...
[Brief summary of changes made]
[Next steps or DONE if complete]

When to stop:
* Page created and renders without errors
* Both tool cards are polished and functional
* Design matches app aesthetic
* Responsive layout works
* Metadata added
* OR max iterations reached

Important:
* Make commits after significant changes
* Test that routes work correctly
* Use existing UI components from components/ui/
* Follow the app's design patterns

Start iteration 1 now. Create the investigar landing page.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: Investigar landing page build complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\investigar-landing-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 10
        Write-Host ""
    }

    Write-Host "Check: finanwas/src/app/(main)/investigar/page.tsx" -ForegroundColor Yellow
    Write-Host "Test: Visit /investigar in your app" -ForegroundColor Yellow
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
