$root = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $root

# 1. Run PM2 start on ecosystem.config.js
Start-Process -FilePath "cmd.exe" -ArgumentList "/c pm2 start ecosystem.config.js" -WorkingDirectory $root -WindowStyle Hidden -Wait

# 2. Wait up to 15 seconds for http://localhost:3000 to be responsive
$timeout = 15
for ($i = 0; $i -lt $timeout; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

# 3. Launch dedicated app window (Edge in --app mode, or Chrome, or default browser)
$edgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
}
$chromePath = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
}

if (Test-Path $edgePath) {
    Start-Process -FilePath $edgePath -ArgumentList "--app=http://localhost:3000"
} elseif (Test-Path $chromePath) {
    Start-Process -FilePath $chromePath -ArgumentList "--app=http://localhost:3000"
} else {
    Start-Process "http://localhost:3000"
}
