# OpenClaw Enterprise Kit - 快速入门

## 前提条件

- Windows 10/11 或 Linux/macOS
- Node.js 18.x+
- 网络连接
- 一个 AI API Key（中转站亦可）

## 一键部署（推荐）

### Windows

```powershell
git clone https://github.com/superLDA/openclaw-enterprise-kit.git
cd openclaw-enterprise-kit
.\deploy\setup.bat
```

### Linux/macOS

```bash
git clone https://github.com/superLDA/openclaw-enterprise-kit.git
cd openclaw-enterprise-kit
chmod +x deploy/setup.sh
sudo ./deploy/setup.sh
```

## 手动部署

```bash
# 安装 OpenClaw
npm install -g openclaw

# 初始化
openclaw setup

# 启动 Gateway
openclaw gateway run --port 18789
```

## 配置微信通道

在另一台设备上打开终端：

```bash
openclaw channels login --channel openclaw-weixin
```

然后用微信扫描二维码即可。

## 验证安装

```bash
# 查看 Gateway 状态
openclaw gateway status

# 健康检查
.\scripts\health-check.cmd
```

## 下一步

- [部署指南](DEPLOY.md) - 详细部署说明
- [Skill 开发](SKILLS.md) - 自定义技能开发
- [故障排除](TROUBLESHOOT.md) - 常见问题解决
