param(
  [string]$Url = "http://127.0.0.1:4321/",
  [int]$StartupTimeoutSec = 90,
  [string]$ChromePath = "",
  [string]$ProfileDir = ""
)

$ErrorActionPreference = "Stop"

function Resolve-ChromePath {
  param([string]$Preferred)

  if (-not [string]::IsNullOrWhiteSpace($Preferred) -and (Test-Path $Preferred)) {
    return $Preferred
  }

  $candidates = @(
    (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
    (Join-Path $env:LocalAppData "Google\Chrome\Application\chrome.exe")
  )

  foreach ($item in $candidates) {
    if (Test-Path $item) {
      return $item
    }
  }

  $cmd = Get-Command chrome.exe -ErrorAction SilentlyContinue
  if ($cmd -and (Test-Path $cmd.Source)) {
    return $cmd.Source
  }

  throw "Chrome was not found. Install Chrome or pass -ChromePath."
}

function Stop-ProcessTree {
  param([int]$ProcessId)

  try {
    cmd /c "taskkill /PID $ProcessId /T /F >nul 2>&1" | Out-Null
  } catch {
    # ignore cleanup failures
  }
}

$root = Split-Path -Parent $PSScriptRoot
$siteDir = Join-Path $root "site"
$publishScript = Join-Path $PSScriptRoot "publish.ps1"

if (-not (Test-Path $siteDir)) {
  throw "Missing directory: $siteDir"
}
if (-not (Test-Path $publishScript)) {
  throw "Missing script: $publishScript"
}

$chromeExe = Resolve-ChromePath -Preferred $ChromePath
$profileDir = if (-not [string]::IsNullOrWhiteSpace($ProfileDir)) {
  $ProfileDir
} else {
  Join-Path $env:LocalAppData "CodexBlogPreviewChrome"
}
New-Item -ItemType Directory -Path $profileDir -Force | Out-Null

$devProcess = $null
$chromeProcess = $null

try {
  Write-Host "Starting local dev server..."
  $devProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm.cmd run dev" `
    -WorkingDirectory $siteDir `
    -PassThru

  $deadline = (Get-Date).AddSeconds($StartupTimeoutSec)
  $ready = $false

  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 900
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Head -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        $ready = $true
        break
      }
    } catch {
      # keep polling
    }
  }

  if (-not $ready) {
    throw "Dev server startup timed out after $StartupTimeoutSec seconds: $Url"
  }

  Write-Host "Opening Chrome: $Url"
  $chromeProcess = Start-Process -FilePath $chromeExe `
    -ArgumentList @(
      "--new-window",
      "--user-data-dir=$profileDir",
      "--no-first-run",
      "--no-default-browser-check",
      $Url
    ) `
    -PassThru

  Write-Host "Close this Chrome window to stop dev server and publish."
  Wait-Process -Id $chromeProcess.Id
}
finally {
  if ($devProcess -and -not $devProcess.HasExited) {
    Write-Host "Stopping local dev server..."
    Stop-ProcessTree -ProcessId $devProcess.Id
  }
}

try {
  Write-Host "Publishing to GitHub..."
  & $publishScript
  if ($LASTEXITCODE -ne 0) {
    throw "Publish failed."
  }
}
catch {
  throw
}

Write-Host "Done."
