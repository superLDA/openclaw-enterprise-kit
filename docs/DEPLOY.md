# 部署指南

## 目录

1. [环境准备](#1-环境准备)
2. [安装方式](#2-安装方式)
3. [配置 API](#3-配置-api)
4. [配置通道](#4-配置通道)
5. [开机自启](#5-开机自启)
6. [生产环境部署建议](#6-生产环境部署建议)

---

## 1. 环境准备

### 系统要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 1 核 | 2 核 |
| 内存 | 512 MB | 2 GB |
| 磁盘 | 1 GB | 10 GB |
| Node.js | 18.x | 20.x LTS |

### 安装 Node.js

**Windows**: 从 [nodejs.org](https://nodejs.org) 下载安装包

**Linux**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS**:
```bash
brew install node@20
```

---

## 2. 安装方式

### 方式一：一键脚本（推荐）

```bash
git clone https://github.com/superLDA/openclaw-enterprise-kit.git
cd openclaw-enterprise-kit
./deploy/setup.bat   # Windows
# 或
sudo ./deploy/setup.sh  # Linux/macOS
```

### 方式二：npm 全局安装

```bash
npm install -g openclaw
```

### 方式三：Docker 部署

```dockerfile
FROM node:20-alpine
RUN npm install -g openclaw
EXPOSE 18789
CMD ["openclaw", "gateway", "run", "--port", "18789"]
```

---

## 3. 配置 API

OpenClaw 支持多种 AI 模型提供商：

### DeepSeek（推荐 - 性价比高）

```bash
openclaw configure
# 选择 provider: deepseek
# 输入: https://api.deepseek.com
# 输入 API Key
```

### 中转站（zhouliuai.online）

```bash
openclaw configure
# 选择 provider: custom
# 输入: https://zhouliuai.online/v1
# 输入 API Key
```

### 配置文件直接修改

编辑 `~/.openclaw/openclaw.json`:

```json
{
  "models": {
    "providers": {
      "custom": {
        "baseUrl": "https://zhouliuai.online/v1",
        "apiKey": "sk-xxxx",
        "models": [
          {
            "id": "gpt-4o",
            "name": "GPT-4o"
          }
        ]
      }
    }
  }
}
```

---

## 4. 配置通道

### 微信

```bash
openclaw channels login --channel openclaw-weixin
```

扫码绑定后即可通过微信与 AI 助手对话。

### Telegram

```bash
openclaw channels login --channel telegram
```

### Discord

```bash
openclaw channels login --channel discord
```

---

## 5. 开机自启

### Windows

本项目部署脚本会自动配置：
- ✅ BootTrigger（开机自启）
- ✅ RestartOnFailure（失败自动重启）
- ✅ 看门狗守护进程（30秒检测）

### Linux（systemd）

部署脚本自动创建 systemd 服务：

```bash
sudo systemctl enable openclaw-gateway
sudo systemctl start openclaw-gateway
```

---

## 6. 生产环境部署建议

### 安全加固

1. 配置 Token 认证
2. 限制绑定到 localhost
3. 启用 HTTPS
4. 配置访问白名单

### 高可用

1. 使用 PM2 进程管理
2. 配置反向代理（Nginx）
3. 数据库持久化
4. 日志轮转

### 监控告警

1. 配置健康检查端点
2. 接入 Prometheus + Grafana
3. 设置 Webhook 告警通知
