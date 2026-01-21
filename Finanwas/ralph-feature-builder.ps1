# Ralph Agent - Autonomous Feature Builder
# This script runs Ralph to autonomously implement features from features_future.md

param(
    [int]$MaxIterations = 20
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ralph: Autonomous Feature Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to finanwas directory
$OriginalDir = Get-Location
Set-Location "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\finanwas"

Write-Host "Working directory: finanwas/" -ForegroundColor Yellow
Write-Host "Objective: Build features from features_future.md" -ForegroundColor Yellow
Write-Host "Max iterations: $MaxIterations" -ForegroundColor Yellow
Write-Host "Strategy: Low-effort, high-value features first" -ForegroundColor Yellow
Write-Host ""

# Read the prompt
$PromptFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\prompt-feature-builder.md"
$PromptContent = Get-Content -Path $PromptFile -Raw

# Create loop instructions
$LoopInstructions = @'

AUTONOMOUS LOOP INSTRUCTIONS

You are Ralph, an autonomous feature-building agent.

LOOP CONTROL:
* You will run for up to 20 iterations
* Each iteration = Pick ONE feature, implement it COMPLETELY, update features_future.md, commit
* After each iteration, append to C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\feature-builder-progress.txt
* Include: iteration number, feature name, what you built, files changed, next feature
* Stop when you have completed 10+ features OR max iterations reached

PROGRESS TRACKING:
At the end of EACH iteration, write to feature-builder-progress.txt:

Iteration X - [Feature Name] - COMPLETE
Implementation: [Brief description]
Files changed: [List]
Commit: [hash]
Next: [Next feature name]
---

FEATURE COMPLETION FORMAT:
When you complete a feature, update features_future.md:

Change this:
### **Dark Mode Support**

To this:
### ✅ **Dark Mode Support** - COMPLETED
**Completed**: 2026-01-21
**Implementation Notes**: [What you built, how it works]

ITERATION WORKFLOW:
1. Read features_future.md to see what is NOT yet marked with ✅
2. Pick next feature (low effort, high priority)
3. Implement feature COMPLETELY
4. Update features_future.md with ✅ and notes
5. Commit with proper message
6. Log to feature-builder-progress.txt
7. Continue to next iteration

PRIORITIZATION:
* Start with LOW EFFORT features first (quick wins)
* Prioritize Should-have > Nice-to-have > Could-have
* Skip features requiring external paid APIs for now
* Focus on user-facing improvements

QUALITY STANDARDS:
* Follow existing code patterns exactly
* Use existing UI components
* Add proper error handling
* Responsive design
* TypeScript type safety
* Test that it works

START NOW:
Begin iteration 1. Pick your first feature and implement it completely.
'@

$FullPrompt = $PromptContent + $LoopInstructions

Write-Host "Starting Ralph agent..." -ForegroundColor Green
Write-Host "Ralph will autonomously implement features and update features_future.md" -ForegroundColor Green
Write-Host ""
Write-Host "Monitor progress: feature-builder-progress.txt" -ForegroundColor Cyan
Write-Host "Feature tracking: features_future.md (will show checkmarks as Ralph completes features)" -ForegroundColor Cyan
Write-Host ""

# Run Claude with the prompt
try {
    claude -p $FullPrompt --dangerously-skip-permissions

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Ralph: Feature building complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Show progress file if it exists
    $ProgressFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\feature-builder-progress.txt"
    if (Test-Path $ProgressFile) {
        Write-Host "Progress Summary:" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $ProgressFile | Select-Object -Last 20
        Write-Host ""
    }

    # Count completed features
    $FeaturesFile = "C:\Users\fran-\OneDrive\Escritorio\FINANCESWAS\Finanwas\features_future.md"
    if (Test-Path $FeaturesFile) {
        $CompletedCount = (Get-Content $FeaturesFile | Select-String -Pattern "###.*COMPLETED").Count
        Write-Host "Features completed: $CompletedCount" -ForegroundColor Green
        Write-Host ""
    }

    Write-Host "Review changes: git log" -ForegroundColor Yellow
    Write-Host "See updated features: features_future.md" -ForegroundColor Yellow
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
