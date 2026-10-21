@echo off
echo Stopping Track Life services...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\stop-app.ps1"
echo Done.
