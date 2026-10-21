@echo off
echo Creating Track Life desktop shortcut...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\create-desktop-shortcut.ps1"
echo Done! You can now launch Track Life from your Desktop.
pause
