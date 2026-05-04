@echo off
chcp 65001 >nul
title OpenClaw Watchdog v2 - 端口检测守护

:: OpenClaw Watchdog
:: 基于端口检测的自恢复守护进程
:: 每 30 秒检查 Gateway 18789 端口

set GATEWAY_PORT=18789
set WORKSPACE=%USERPROFILE%\.openclaw

:loop
timeout /t 30 /nobreak >nul 2>&1

:: 检测端口 18789 是否在监听
netstat -an 2>nul | findstr ":%GATEWAY_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%date% %time%] WATCHDOG: Gateway 端口 %GATEWAY_PORT% 无响应，正在重启...
    start /B "" cmd /c "openclaw gateway run --port %GATEWAY_PORT%"
)

goto loop
