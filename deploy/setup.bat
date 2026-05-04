@echo off
chcp 65001 >nul
title OpenClaw Enterprise Kit - 一键部署

setlocal enabledelayedexpansion

set "OC_VERSION=2026.4.22"
set "OC_PORT=18789"
set "GATEWAY_TASK=OpenClaw Gateway"
set "SELFCHECK_TASK=OpenClaw SelfCheck"
set "WORKSPACE_DIR=%USERPROFILE%\.openclaw"
set "WATCHDOG_CMD=%WORKSPACE_DIR%\watchdog.cmd"

:: ====================
::   彩色输出函数
:: ====================
call :color Cyan
echo.
echo ╔══════════════════════════════════════════╗
echo ║   OpenClaw Enterprise Kit v1.0         ║
echo ║   🦞 企业级 AI 助手一键部署            ║
echo ╚══════════════════════════════════════════╝
echo.
call :color White

:: ====================
::   步骤 1: 安装 Node.js
:: ====================
call :color Yellow
echo [1/6] 检查 Node.js 环境...
call :color White

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] 未检测到 Node.js 尝试自动安装...
    echo 请前往 https://nodejs.org 下载安装 Node.js 18.x 或更高版本
    echo 安装完成后重新运行此脚本
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER%

where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
    echo [OK] npm %NPM_VER%
)

:: ====================
::   步骤 2: 安装 OpenClaw
:: ====================
call :color Yellow
echo.
echo [2/6] 安装/更新 OpenClaw...
call :color White

npm install -g openclaw 2>&1 | findstr /V "npm WARN"
echo [OK] OpenClaw %OC_VERSION%

:: ====================
::   步骤 3: 配置工作目录
:: ====================
call :color Yellow
echo.
echo [3/6] 配置工作目录...
call :color White

if not exist "%WORKSPACE_DIR%" (
    mkdir "%WORKSPACE_DIR%"
)
echo [OK] 工作目录: %WORKSPACE_DIR%

:: ====================
::   步骤 4: 部署看门狗
:: ====================
call :color Yellow
echo.
echo [4/6] 部署看门狗守护进程...
call :color White

:: 复制看门狗脚本
copy /Y "%~dp0watchdog.cmd" "%WORKSPACE_DIR%\watchdog.cmd" >nul 2>&1
echo [OK] 看门狗脚本已部署

:: 复制启动脚本
copy /Y "%~dp0..\scripts\health-check.cmd" "%WORKSPACE_DIR%\self-check.cmd" >nul 2>&1
echo [OK] 健康检查脚本已部署

:: ====================
::   步骤 5: 配置自启动
:: ====================
call :color Yellow
echo.
echo [5/6] 配置开机自启动...
call :color White

:: 用户级启动快捷方式
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "VBS_SCRIPT=%WORKSPACE_DIR%\start-openclaw.vbs"

echo ' OpenClaw 启动脚本 - 无窗口启动 > "%VBS_SCRIPT%"
echo Set WshShell = CreateObject("WScript.Shell") >> "%VBS_SCRIPT%"
echo WshShell.Run """%WORKSPACE_DIR%\gateway.cmd""", 0, False >> "%VBS_SCRIPT%"
echo WScript.Sleep 8000 >> "%VBS_SCRIPT%"
echo WshShell.Run """%WORKSPACE_DIR%\watchdog.cmd""", 0, False >> "%VBS_SCRIPT%"

echo [OK] VBS 启动脚本已创建

:: 创建快捷方式（通过 PowerShell）
powershell -Command ^
    "$ws = New-Object -ComObject WScript.Shell; ^
     $sc = $ws.CreateShortcut('%STARTUP_DIR%\OpenClaw.lnk'); ^
     $sc.TargetPath = 'wscript.exe'; ^
     $sc.Arguments = '%VBS_SCRIPT%'; ^
     $sc.WindowStyle = 0; ^
     $sc.Description = 'OpenClaw Enterprise AI Assistant'; ^
     $sc.Save()" >nul 2>&1

echo [OK] 开机启动项已添加

:: ====================
::   步骤 6: 最终验证
:: ====================
call :color Yellow
echo.
echo [6/6] 启动服务并验证...
call :color White

:: 启动 Gateway
start /B "" cmd /c "openclaw gateway run --port %OC_PORT%"

:: 等待启动
ping 127.0.0.1 -n 6 >nul

:: 验证端口
netstat -an | findstr ":%OC_PORT% " | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :color Green
    echo [OK] Gateway 端口 %OC_PORT% 已监听
    call :color White
) else (
    call :color Red
    echo [WARN] Gateway 启动中...请稍后检查
    call :color White
)

:: 启动看门狗
start /B "" "%WORKSPACE_DIR%\watchdog.cmd"
echo [OK] 看门狗已启动

echo.
call :color Green
echo ╔══════════════════════════════════════════╗
echo ║          🎉 部署成功！                  ║
echo ╠══════════════════════════════════════════╣
echo ║                                          ║
echo ║  OpenClaw Gateway 正在运行               ║
echo ║  端口: %OC_PORT%                         ║
echo ║  控制台: http://localhost:%OC_PORT%       ║
echo ║                                          ║
echo ║  下一步：                                 ║
echo ║  1. 配置 API Key                         ║
echo ║  2. 添加微信通道                         ║
echo ║  3. 安装 Skills                          ║
echo ║                                          ║
echo ╚══════════════════════════════════════════╝
call :color White
echo.

echo 配置通道：
echo   openclaw channels login --channel openclaw-weixin
echo.
echo 查看状态：
echo   openclaw gateway status
echo.
echo 安装 Skills：
echo   openclaw skills install --name weather
echo.

pause
exit /b 0

:color
if /i "%1"=="Cyan" echo [92m
if /i "%1"=="Yellow" echo [93m
if /i "%1"=="Green" echo [92m
if /i "%1"=="Red" echo [91m
if /i "%1"=="White" echo [0m
exit /b
