$root = (Resolve-Path "$PSScriptRoot\..").Path
$desktop = [Environment]::GetFolderPath('Desktop')
$wsh = New-Object -ComObject WScript.Shell

$shortcutPath = Join-Path $desktop "Track Life.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$root\launch-app.vbs`""
$shortcut.WorkingDirectory = "$root"

$iconPath = "$root\frontend\src\app\favicon.ico"
if (Test-Path $iconPath) {
    $shortcut.IconLocation = "$iconPath, 0"
}
$shortcut.Description = "Launch Track Life App"
$shortcut.Save()

Write-Host "Success! Desktop shortcut created at: $shortcutPath"
