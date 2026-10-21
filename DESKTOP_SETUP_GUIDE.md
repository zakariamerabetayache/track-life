# Track Life — Desktop App & Launcher Architecture Guide

This guide explains how the **Zero-Terminal Desktop Launcher** works, why each component was designed this way, and what each generated file and command does under the hood.

---

## 1. The Big Picture

### The Problem Before
Originally, running Track Life required:
1. Opening two separate terminal windows (one for the **Express backend** on port 3001, one for the **Next.js frontend** on port 3000).
2. Leaving black command-prompt windows open on the screen while using the app.
3. Manually opening a web browser, typing `http://localhost:3000`, and dealing with browser tabs, bookmarks, and URL bars.
4. If you sent the app to a friend, they had to know how to open terminals, run `npm install`, start services, and troubleshoot ports.

### The Solution
We transformed Track Life into a **1-click Desktop Application** without needing complex frameworks like Electron:
```
[User clicks Desktop Icon]
         │
         ▼
[launch-app.vbs] ────► 100% silent execution (Zero console flash)
         │
         ▼
[scripts/start-app.ps1]
   ├── Checks if Backend (3001) is running ──► If not, starts it silently
   ├── Checks if Frontend (3000) is running ─► If not, starts it silently
   ├── Waits until http://localhost:3000 responds
   └── Launches Edge/Chrome in "--app" mode
         │
         ▼
[App Window appears on screen — looks like a native desktop app!]
```

---

## 2. Each Generated File & Its Purpose

### 1. `launch-app.vbs` (Root)
* **What it does:** The primary entry point for launching the app silently.
* **Why VBScript:** If you double-click a `.bat` or `.ps1` file directly in Windows, a black console window flashes on screen. Running a script through Windows' native `wscript.exe` with execution flag `0` guarantees **zero visible windows**.
* **Key Code:**
  ```vbs
  WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""...""", 0, False
  ```
  - `0`: Window mode is completely invisible.
  - `False`: Returns immediately so `wscript.exe` exits without consuming background memory.

---

### 2. `scripts/start-app.ps1`
* **What it does:** The orchestrator that coordinates PM2 and the browser.
* **Steps it performs:**
  1. **Runs PM2 Silently:** Automatically executes `pm2 start ecosystem.config.js` in the background (no manual terminal command needed).
  2. **Health Check Loop:** Pings `http://localhost:3000` once per second (up to 15 seconds) until the frontend is responding.
  3. **Launches App Mode:** Opens Edge/Chrome in dedicated `--app=http://localhost:3000` mode.

---

### 3. `scripts/create-desktop-shortcut.ps1` & `create-desktop-shortcut.bat`
* **What it does:** Creates the **"Track Life"** shortcut on the current user's Windows Desktop (`C:\Users\<User>\Desktop\Track Life.lnk`).
* **Why it matters:**
  - It binds the shortcut to `launch-app.vbs` via `wscript.exe`.
  - It applies the custom project icon from `frontend/src/app/favicon.ico`.
  - Double-clicking the `.bat` file runs this script without needing to remember any PowerShell commands.

---

### 4. `scripts/stop-app.ps1`, `stop-app.vbs` & `stop-app.bat`
* **What it does:** Gracefully shuts down the background processes.
* **How it works:**
  - Looks for any active process listening on ports `3000` and `3001` using `Get-NetTCPConnection`.
  - Terminates those specific processes using `Stop-Process -Force`.
  - `stop-app.vbs` can be double-clicked to close the services silently, and `stop-app.bat` is available if you prefer a console confirmation.

---

### 5. `setup-for-friend.bat` (Root)
* **What it does:** An all-in-one setup script for a new computer or another person.
* **Steps it automates:**
  1. Checks if `node` is installed on their system; warns them with a link if it's missing.
  2. Runs `npm install` inside the `backend` folder.
  3. Runs `npx prisma generate` to set up Prisma Client.
  4. Runs `npm install` inside the `frontend` folder.
  5. Automatically creates the **Track Life** desktop shortcut on their machine.

---

## 3. Explaining Key Commands & Concepts

### A. Dedicated App Mode (`--app=http://localhost:3000`)
Every modern Windows computer has Microsoft Edge pre-installed. Passing the `--app` flag causes Edge (or Chrome) to open the page in **Application Mode**:
- **No address bar**
- **No tab bar**
- **No bookmarks or extension icons**
- **Has its own window and taskbar entry**
This gives the user the feel of a native desktop application (like Slack, Notion, or Spotify) without packaging 200MB of Electron binaries.

### B. Hidden Process Execution (`-WindowStyle Hidden`)
When launching background Node.js processes, PowerShell's `Start-Process ... -WindowStyle Hidden` instructs the Windows OS kernel not to allocate a console window for the new process, ensuring Node runs quietly as a background service.

### C. Execution Policy Bypass (`-ExecutionPolicy Bypass`)
Windows PowerShell blocks unsigned scripts by default. Using `-ExecutionPolicy Bypass` tells PowerShell to run our local script without changing global computer security settings or triggering policy prompts.

### D. Port Checking (`Get-NetTCPConnection`)
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
```
This native PowerShell cmdlet checks if an application is currently listening on port 3000. It prevents launching multiple instances of the server if the user clicks the shortcut several times.

---

## 4. How to Share This App With a Friend

1. **Send the folder** (zip the project folder, excluding `node_modules` and `.next` to keep the zip small).
2. Ensure your friend has **Node.js** installed.
3. Have your friend open the folder and double-click:
   ```
   setup-for-friend.bat
   ```
4. Once setup finishes, they will see the **Track Life** icon on their desktop.
5. They double-click the icon anytime to use the app.

*(Note: For the database, if your friend does not have a local PostgreSQL server, you can switch Prisma to SQLite in `backend/prisma/schema.prisma` with `provider = "sqlite"` so that the database is just a local self-contained file with zero external database configuration).*
