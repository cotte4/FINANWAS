# Ralph for Claude Code - Long-running AI agent loop (PowerShell)
# Usage: .\ralph-claude.ps1 [-MaxIterations 10]
# Adapted from the original Ralph pattern for use with Claude Code CLI
# This version uses PowerShell native JSON parsing (no jq required)

param(
    [int]$MaxIterations = 10
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PrdFile = Join-Path $ScriptDir "prd.json"
$ProgressFile = Join-Path $ScriptDir "progress.txt"
$ArchiveDir = Join-Path $ScriptDir "archive"
$LastBranchFile = Join-Path $ScriptDir ".last-branch"
$PromptFile = Join-Path $ScriptDir "prompt-claude.md"

# Check for required tools
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "Claude Code CLI not found. Install it from https://claude.com/claude-code"
    exit 1
}

if (-not (Test-Path $PrdFile)) {
    Write-Error "prd.json not found at $PrdFile`nCreate a prd.json file with your user stories first."
    exit 1
}

# Helper function to read PRD
function Get-Prd {
    Get-Content $PrdFile -Raw | ConvertFrom-Json
}

# Helper function to get incomplete story count
function Get-IncompleteCount {
    $prd = Get-Prd
    @($prd.userStories | Where-Object { $_.passes -eq $false }).Count
}

# Helper function to get branch name
function Get-BranchName {
    $prd = Get-Prd
    $prd.branchName
}

# Archive previous run if branch changed
if ((Test-Path $PrdFile) -and (Test-Path $LastBranchFile)) {
    $CurrentBranch = Get-BranchName
    $LastBranch = Get-Content $LastBranchFile -ErrorAction SilentlyContinue

    if ($CurrentBranch -and $LastBranch -and ($CurrentBranch -ne $LastBranch)) {
        $Date = Get-Date -Format "yyyy-MM-dd"
        $FolderName = $LastBranch -replace "^ralph/", ""
        $ArchiveFolder = Join-Path $ArchiveDir "$Date-$FolderName"

        Write-Host "Archiving previous run: $LastBranch"
        New-Item -ItemType Directory -Path $ArchiveFolder -Force | Out-Null
        if (Test-Path $PrdFile) { Copy-Item $PrdFile $ArchiveFolder }
        if (Test-Path $ProgressFile) { Copy-Item $ProgressFile $ArchiveFolder }
        Write-Host "   Archived to: $ArchiveFolder"

        # Reset progress file for new run
        @"
# Ralph Progress Log
Started: $(Get-Date)
---
"@ | Set-Content $ProgressFile
    }
}

# Track current branch
if (Test-Path $PrdFile) {
    $CurrentBranch = Get-BranchName
    if ($CurrentBranch) {
        $CurrentBranch | Set-Content $LastBranchFile
    }
}

# Initialize progress file if it doesn't exist
if (-not (Test-Path $ProgressFile)) {
    @"
# Ralph Progress Log
Started: $(Get-Date)
---
"@ | Set-Content $ProgressFile
}

Write-Host ""
Write-Host "Starting Ralph (Claude Code) - Max iterations: $MaxIterations"
Write-Host "PRD: $PrdFile"
Write-Host "Progress: $ProgressFile"
Write-Host ""

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host ""
    Write-Host "======================================================="
    Write-Host "  Ralph Iteration $i of $MaxIterations"
    Write-Host "======================================================="

    # Check if all stories are already complete
    $Incomplete = Get-IncompleteCount
    if ($Incomplete -eq 0) {
        Write-Host ""
        Write-Host "All stories already complete!"
        exit 0
    }

    Write-Host "Remaining stories: $Incomplete"
    Write-Host ""

    # Read the prompt
    $Prompt = Get-Content $PromptFile -Raw

    # Add context about file locations
    $FullPrompt = @"
$Prompt

## File Locations (for this run)
- PRD file: $PrdFile
- Progress file: $ProgressFile
- Script directory: $ScriptDir

Begin working on the next incomplete user story now.
"@

    # Run Claude Code
    # Using --dangerously-skip-permissions for autonomous operation
    try {
        $Output = ""
        claude -p $FullPrompt --dangerously-skip-permissions 2>&1 | ForEach-Object {
            Write-Host $_
            $Output += $_ + "`n"
        }
    }
    catch {
        Write-Host "Claude iteration ended with error: $_"
    }

    # Check for completion signal
    if ($Output -match "<promise>COMPLETE</promise>") {
        Write-Host ""
        Write-Host "======================================================="
        Write-Host "  Ralph completed all tasks!"
        Write-Host "  Finished at iteration $i of $MaxIterations"
        Write-Host "======================================================="
        exit 0
    }

    Write-Host ""
    Write-Host "Iteration $i complete. Continuing..."
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "======================================================="
Write-Host "  Ralph reached max iterations ($MaxIterations)"
Write-Host "  without completing all tasks."
Write-Host "  Check $ProgressFile for status."
Write-Host "======================================================="

# Show remaining stories
Write-Host ""
Write-Host "Remaining incomplete stories:"
$prd = Get-Prd
$prd.userStories | Where-Object { $_.passes -eq $false } | ForEach-Object {
    Write-Host "  - $($_.id): $($_.title)"
}

exit 1
