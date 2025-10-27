@echo off
echo ========================================
echo   Nyumbangin Development Setup
echo ========================================
echo.

:: Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] ngrok sudah terinstall!
    goto :start_ngrok
)

echo [!] ngrok belum terinstall
echo.
echo Pilih cara install:
echo 1. Install via npm (Recommended)
echo 2. Install via chocolatey
echo 3. Manual download (akan buka browser)
echo 4. Skip (gunakan localtunnel)
echo.
set /p choice="Pilihan (1-4): "

if "%choice%"=="1" goto :install_npm
if "%choice%"=="2" goto :install_choco
if "%choice%"=="3" goto :install_manual
if "%choice%"=="4" goto :use_localtunnel

:install_npm
echo.
echo Installing ngrok via npm...
call npm install -g ngrok
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal install ngrok via npm
    pause
    exit /b 1
)
goto :start_ngrok

:install_choco
echo.
echo Installing ngrok via chocolatey...
call choco install ngrok -y
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal install. Pastikan chocolatey terinstall.
    pause
    exit /b 1
)
goto :start_ngrok

:install_manual
echo.
echo Membuka https://ngrok.com/download di browser...
start https://ngrok.com/download
echo.
echo Setelah download:
echo 1. Extract ngrok.exe
echo 2. Copy ke folder project atau C:\Windows\System32
echo 3. Jalankan script ini lagi
pause
exit /b 0

:use_localtunnel
echo.
echo Installing localtunnel...
call npm install -g localtunnel
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal install localtunnel
    pause
    exit /b 1
)
echo.
echo Starting localtunnel...
echo.
start cmd /k "lt --port 3000"
echo.
echo ========================================
echo Localtunnel started!
echo Copy URL yang muncul dan set di Midtrans:
echo https://your-url.loca.lt/api/webhook/midtrans
echo ========================================
pause
exit /b 0

:start_ngrok
echo.
echo Starting ngrok tunnel...
echo.
echo ========================================
echo IMPORTANT: Copy URL di bawah ini!
echo ========================================
echo.
start cmd /k "ngrok http 3000"
echo.
echo Setelah ngrok start:
echo 1. Copy URL https://xxxx.ngrok.io
echo 2. Buka Midtrans Dashboard
echo 3. Settings > Configuration
echo 4. Set Notification URL:
echo    https://xxxx.ngrok.io/api/webhook/midtrans
echo.
echo ========================================
pause
