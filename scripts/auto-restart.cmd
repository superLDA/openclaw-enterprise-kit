@echo off
chcp 65001 >nul
title OpenClaw 自动重启

:: 基于 Windows 定时任务的自动重启脚本
:: 配置为每 5 分钟运行一次

set GATEWAY_PORT=18789
set LOGFILE=%USERPROFILE%\.openclaw\auto-restart.log

:: 记录当前时间
echo [%date% %time%] >> "%LOGFILE%"

:: 检查端口
netstat -an 2>nul | findstr ":%GATEWAY_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%date% %time%] ❌ Gateway 离线，正在重启... >> "%LOGFILE%"
    start /B "" cmd /c "openclaw gateway run --port %GATEWAY_PORT%"
    echo [%date% %time%] ✅ 重启命令已发送 >> "%LOGFILE%"
) else (
    rem 静默跳过，不写日志
)

:: 保留最近 100 条日志
powershell -Command "if((Get-Content '%LOGFILE%').Count -gt 100) { Get-Content '%LOGFILE%' | Select-Object -Last 100 | Set-Content '%LOGFILE%' }" >nul 2>&1
