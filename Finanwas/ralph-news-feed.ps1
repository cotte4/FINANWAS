# Ralph Agent - Financial News Feed
# This script runs Ralph to implement personalized news feed

param(
    [int]$MaxIterations = 5
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Financial News Feed" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Add personalized financial news feed" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-news-feed.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, building a news feed. Follow these rules:

Loop Control:
* Max 5 iterations
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\news-feed-progress.txt
* Include: iteration number, what was built, API status
* Stop when news feed is working

Progress Tracking:
At the end of each iteration, write to news-feed-progress.txt:
Iteration X complete
[News service status]
[Components created]
[Next steps or DONE]

When to stop:
* News service created with NewsAPI integration
* Caching implemented
* API endpoint working
* NewsFeed component displays news
* Personalized based on portfolio
* Integrated into dashboard
* Documentation created
* OR max iterations reached

Implementation priority:
1. Iteration 1: News service + API integration
2. Iteration 2: GET /api/news endpoint with caching
3. Iteration 3: NewsFeed component with tabs
4. Iteration 4: Integration into dashboard
5. Iteration 5: Polish, fallback, documentation

Important:
* Respect NewsAPI free tier limits (100/day)
* Implement 30min caching
* Graceful fallback if API fails

Start iteration 1 now. Create news service with NewsAPI.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: News feed implementation complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\news-feed-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 15
        Write-Host ""
    }

    Write-Host "Note: Remember to set NEWS_API_KEY in .env.local" -ForegroundColor Yellow
    Write-Host "Test: Visit /dashboard or /noticias to see news feed" -ForegroundColor Yellow
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
