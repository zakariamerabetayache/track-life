$root = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $root

# Stop all PM2 services defined in ecosystem.config.js
Start-Process -FilePath "cmd.exe" -ArgumentList "/c pm2 stop ecosystem.config.js" -WorkingDirectory $root -WindowStyle Hidden -Wait

Write-Host "Track Life PM2 services stopped."
