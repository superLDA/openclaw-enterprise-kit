@echo off
chcp 65001 >nul
title OpenClaw 健康检查

echo ╔═══════════════════════════════════╗
echo ║    OpenClaw 系统健康检查        ║
echo ╚═══════════════════════════════════╝
echo.

set "CHECK_PASSED=true"

:: 1. 端口检查
echo [1/5] 端口 18789 ...
netstat -an 2>nul | findstr ":18789 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Gateway 端口正常
) else (
    echo   ❌ Gateway 端口未监听
    set "CHECK_PASSED=false"
)

:: 2. HTTP 健康检查
echo [2/5] HTTP 健康检查 ...
powershell -Command "try { $r=Invoke-RestMethod 'http://localhost:18789/health' -TimeoutSec 5; Write-Host '  ✅ 健康检查通过' -ForegroundColor Green } catch { Write-Host '  ❌ 健康检查失败' -ForegroundColor Red; exit 1 }" 2>nul
if %ERRORLEVEL% NEQ 0 ( set "CHECK_PASSED=false" )

:: 3. Node 进程
echo [3/5] Node.js 进程 ...
tasklist /fi "imagename eq node.exe" 2>nul | find /c "node.exe" >nul
if %ERRORLEVEL% EQU 0 (
    for /f %%i in ('tasklist /fi "imagename eq node.exe" 2^>nul ^| find /c "node.exe"') do set NODE_COUNT=%%i
    echo   ✅ %NODE_COUNT% 个 Node.js 进程运行中
) else (
    echo   ❌ 无 Node.js 进程
    set "CHECK_PASSED=false"
)

:: 4. 看门狗
echo [4/5] 看门狗进程 ...
tasklist /fi "imagename eq cmd.exe" 2>nul | find "watchdog" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ 看门狗运行中
) else (
    echo   ⚠️ 看门狗未运行（非致命）
)

:: 5. System Uptime
echo [5/5] 系统运行时间 ...
for /f "tokens=*" %%i in ('powershell -Command "(Get-Date) - (gcim Win32_OperatingSystem).LastBootUpTime | Select-Object @{N='Uptime';E={$_.Days.ToString()+'天 '+$_.Hours.ToString()+'小时'}}"') do set UPTIME=%%i
echo   🖥️  系统已运行 %UPTIME%

echo.
if "%CHECK_PASSED%"=="true" (
    echo ✅ 所有检查通过 - 系统运行正常
    exit /b 0
) else (
    echo ⚠️  部分检查未通过，请查看上方详情
    exit /b 1
)
