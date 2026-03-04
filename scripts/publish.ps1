param(
  [string]$Message = "",
  [string]$Proxy = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$status = git status --porcelain
if ($status) {
  if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  }
  git add .
  git commit -m $Message
} else {
  Write-Host "No local changes to commit."
}

$maxRetries = 3
for ($i = 1; $i -le $maxRetries; $i++) {
  Write-Host "Push attempt $i/$maxRetries ..."
  if ([string]::IsNullOrWhiteSpace($Proxy)) {
    git push origin main
  } else {
    git -c "http.proxy=$Proxy" -c "https.proxy=$Proxy" push origin main
  }

  if ($LASTEXITCODE -eq 0) {
    if ([string]::IsNullOrWhiteSpace($Proxy)) {
      Write-Host "Done. Pushed to origin/main."
    } else {
      Write-Host "Done. Pushed to origin/main (via proxy $Proxy)."
    }
    exit 0
  }
  Start-Sleep -Seconds 2
}

Write-Host "Push failed after $maxRetries attempts."
Write-Host 'Tip: .\scripts\publish.ps1 -Message "msg" -Proxy "http://127.0.0.1:7890"'
exit 1
