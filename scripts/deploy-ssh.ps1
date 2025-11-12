<#
PowerShell deploy script using scp (OpenSSH) and an SSH private key.
Usage example:
  .\scripts\deploy-ssh.ps1 -Host "your.hostinger.host" -User "u123456789" -KeyPath "$env:USERPROFILE\.ssh\tickets_villa_deploy" -LocalPath ".\hostinger_upload" -RemotePath "/public_html" -Port 22

Notes:
- Requires OpenSSH scp on Windows (Windows 10/11 typically includes it). If not installed, enable "OpenSSH Client" in Optional Features.
- The script uses scp to recursively upload files. It will prompt for passphrase if your key is protected.
- Set $RemotePath to the exact path Hostinger gave you (commonly /home/uXXXXX/public_html).
- This script does not store secrets. For automation, consider using ssh-agent or GitHub Actions with SSH key secret.
#>
param(
    [Parameter(Mandatory=$true)][string]$Host,
    [Parameter(Mandatory=$true)][string]$User,
    [string]$KeyPath = "$env:USERPROFILE\.ssh\id_ed25519",
    [string]$LocalPath = ".\hostinger_upload",
    [string]$RemotePath = "/public_html",
    [int]$Port = 22
)

function Test-ScpAvailable {
    $scpCmd = Get-Command scp -ErrorAction SilentlyContinue
    if (-not $scpCmd) {
        Write-Error "scp (OpenSSH) not found in PATH. Install/enable OpenSSH Client and retry."
        exit 2
    }
}

function Resolve-LocalPath([string]$p){
    if ($p -eq '.') { return (Get-Location).Path }
    return (Resolve-Path -Path $p).Path
}

Test-ScpAvailable

if (-not (Test-Path $KeyPath)) {
    Write-Warning "Private key not found at $KeyPath. If you don't want to use a key, you can omit -KeyPath and use interactive password auth (not recommended)."
}

if (-not (Test-Path $LocalPath)) {
    Write-Error "LocalPath '$LocalPath' does not exist. Build and prepare files first (see README or use npm run build:hostinger)."
    exit 3
}

$absLocal = Resolve-LocalPath $LocalPath
Write-Host ("Uploading contents of: {0} to {1}:{2} (port {3)" -f $absLocal, $User, $Host, $Port)

# Compose scp args. On Windows OpenSSH scp uses -P for port and -i for identity file.
$scpArgs = @()
if (Test-Path $KeyPath) { $scpArgs += "-i"; $scpArgs += (Resolve-Path $KeyPath).Path }
$scpArgs += "-P"; $scpArgs += $Port.ToString()
$scpArgs += "-r"  # recursive

# Use wildcard to copy contents instead of the parent folder itself
$localPattern = Join-Path -Path $absLocal -ChildPath '*'
$remoteId = $User + '@' + $Host + ':' + $RemotePath

# Build final command string for transparency
$cmd = 'scp ' + ($scpArgs -join ' ') + ' "' + $localPattern + '" "' + $remoteId + '"'
Write-Host "Running: $cmd"

# Invoke scp. Use Start-Process so we can inherit stdin for passphrase/password input.
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = 'scp'
$startInfo.Arguments = ($scpArgs + ('"' + $localPattern + '"') + ('"' + $remoteId + '"')) -join ' '
$startInfo.UseShellExecute = $false
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true
$proc = New-Object System.Diagnostics.Process
$proc.StartInfo = $startInfo
$proc.Start() | Out-Null

# Output stdout/stderr while running
while (-not $proc.HasExited) {
    while (-not $proc.StandardOutput.EndOfStream) { Write-Host $proc.StandardOutput.ReadLine() }
    while (-not $proc.StandardError.EndOfStream) { Write-Warning $proc.StandardError.ReadLine() }
    Start-Sleep -Milliseconds 200
}

# Drain remaining
while (-not $proc.StandardOutput.EndOfStream) { Write-Host $proc.StandardOutput.ReadLine() }
while (-not $proc.StandardError.EndOfStream) { Write-Warning $proc.StandardError.ReadLine() }

if ($proc.ExitCode -eq 0) {
    Write-Host "Upload complete."
    exit 0
} else {
    Write-Error "scp failed with exit code $($proc.ExitCode). Check error output above and verify remote path/credentials/permissions."
    exit $proc.ExitCode
}
