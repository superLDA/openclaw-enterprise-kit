#!/bin/bash
# OpenClaw Enterprise Kit - Linux/macOS 一键部署脚本
set -e

OC_PORT=${OC_PORT:-18789}
WORKSPACE="${HOME}/.openclaw"

echo "========================================"
echo "  OpenClaw Enterprise Kit v1.0"
echo "  🦞 企业级 AI 助手一键部署 (Linux/macOS)"
echo "========================================"
echo ""

# 检查 Node.js
echo "[1/5] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装: https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# 安装 OpenClaw
echo ""
echo "[2/5] 安装 OpenClaw..."
npm install -g openclaw 2>&1 | grep -v "npm WARN" || true
echo "✅ OpenClaw 已安装"

# 部署看门狗
echo ""
echo "[3/5] 部署看门狗..."
mkdir -p "${WORKSPACE}"
cp "$(dirname "$0")/watchdog.sh" "${WORKSPACE}/watchdog.sh" 2>/dev/null || true
chmod +x "${WORKSPACE}/watchdog.sh"
echo "✅ 看门狗已部署"

# 配置自动启动（systemd）
echo ""
echo "[4/5] 配置自动启动..."
if command -v systemctl &> /dev/null; then
    cat > /tmp/openclaw-gateway.service << EOF
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=${USER}
ExecStart=$(which openclaw) gateway run --port ${OC_PORT}
Restart=on-failure
RestartSec=30
StartLimitIntervalSec=300
StartLimitBurst=5

[Install]
WantedBy=multi-user.target
EOF
    sudo mv /tmp/openclaw-gateway.service /etc/systemd/system/openclaw-gateway.service
    sudo systemctl daemon-reload
    sudo systemctl enable openclaw-gateway.service
    echo "✅ systemd 服务已配置"
else
    echo "⚠️ 未检测到 systemd，请手动配置自动启动"
fi

# 启动服务
echo ""
echo "[5/5] 启动服务..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start openclaw-gateway.service
    sleep 3
    if systemctl is-active --quiet openclaw-gateway.service; then
        echo "✅ Gateway 服务运行中"
    fi
fi

echo ""
echo "========================================"
echo "  🎉 部署成功！"
echo ""
echo "  Gateway: http://localhost:${OC_PORT}"
echo ""
echo "  配置微信: openclaw channels login --channel openclaw-weixin"
echo "========================================"
