# 🦞 OpenClaw Enterprise Kit

> **Enterprise-grade AI Assistant Deployment Framework**  
> 一键部署 24/7 在线的 AI 智能助手 | 多平台集成 | 自恢复机制 | 企业级安全

[![GitHub stars](https://img.shields.io/github/stars/superLDA/openclaw-enterprise-kit?style=social)](https://github.com/superLDA/openclaw-enterprise-kit)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey)](https://openclaw.ai)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/superLDA/openclaw-enterprise-kit/pulls)

---

## 🌟 项目亮点

| 特性 | 说明 |
|------|------|
| 🚀 **一键部署** | 30 秒启动，零配置上手 |
| 🔄 **自恢复机制** | 看门狗守护 + 定时自检，宕机自动重启 |
| 🔌 **多平台集成** | 微信、Telegram、Discord、WhatsApp 一网打尽 |
| 🛡️ **企业级安全** | Token 认证 + 访问控制 + 审计日志 |
| 🧩 **可扩展 Skill** | 即装即用的技能市场，自定义开发 |
| 📊 **智能模型路由** | 自动切换 DeepSeek/GPT-4o/Claude 等模型 |
| 🏠 **本地私有化部署** | 数据不出门，完全掌控 |

---

## 📋 目录结构

```
openclaw-enterprise-kit/
├── deploy/                  # 一键部署脚本
│   ├── setup.bat           # Windows 一键安装
│   ├── setup.sh            # Linux/macOS 一键安装  
│   └── watchdog.cmd        # 看门狗守护脚本
├── config/                  # 配置文件
│   ├── openclaw.json       # 主配置文件模板
│   └── models.json         # 模型路由配置
├── skills/                  # Custom Skills
│   ├── README.md           # Skill 开发指南
│   ├── weather/            # 天气查询 Skill 示例
│   └── todo/               # 待办事项 Skill 示例
├── docs/                    # 文档
│   ├── QUICKSTART.md       # 快速入门
│   ├── DEPLOY.md           # 部署指南
│   ├── SKILLS.md           # Skill 开发文档
│   └── TROUBLESHOOT.md     # 故障排除
├── scripts/                 # 管理脚本
│   ├── health-check.cmd    # 健康检查
│   ├── auto-restart.cmd    # 自动重启
│   └── backup.js           # 备份脚本
├── .github/                 # GitHub 配置
│   └── workflows/
│       └── ci.yml          # CI 自动化流水线
├── README.md               # 项目说明（本文件）
├── LICENSE                  # MIT 许可证
└── package.json            # 项目配置
```

---

## 🚀 快速开始（3 分钟）

### 前提条件

- **Node.js** ≥ 18.x（[下载](https://nodejs.org/)）
- **npm**（随 Node.js 安装）
- 一个 **OpenAI 兼容 API Key**（支持中转站）

### Windows 一键安装

```powershell
# 克隆项目
git clone https://github.com/superLDA/openclaw-enterprise-kit.git
cd openclaw-enterprise-kit

# 一键部署（管理员身份运行）
.\deploy\setup.bat
```

### Linux/macOS 一键安装

```bash
# 克隆项目
git clone https://github.com/superLDA/openclaw-enterprise-kit.git
cd openclaw-enterprise-kit

# 一键部署
chmod +x deploy/setup.sh
sudo ./deploy/setup.sh
```

### 手动安装

```bash
# 安装 OpenClaw
npm install -g @anthropic-ai/claude-code
npm install -g openclaw

# 初始化配置
openclaw setup

# 启动网关
openclaw gateway --port 18789
```

---

## 🔧 核心功能

### 1️⃣ 智能看门狗（Self-Healing）

系统自带三层自恢复机制：

```
┌─────────────────────────────────────┐
│          OpenClaw Gateway            │
├─────────────────────────────────────┤
│  Layer 1: 系统定时任务 (RestartOnFailure)│
│     → 失败后 1 分钟自动重启           │
├─────────────────────────────────────┤
│  Layer 2: 看门狗进程 (30秒检测)       │
│     → 端口检测 + HTTP 健康检查        │
├─────────────────────────────────────┤
│  Layer 3: 自愈定时任务 (每5分钟)       │
│     → 自动修复配置异常                 │
└─────────────────────────────────────┘
```

### 2️⃣ 多模型智能路由

支持自动切换多种 AI 模型：

```json
{
  "deepseek-chat": "日常对话 - 经济高效",
  "gpt-4o": "复杂推理 - 高精度",
  "claude-sonnet-4": "创意写作 - 高质量",
  "kimi-k2-thinking": "深度分析 - 思维链"
}
```

### 3️⃣ 企业级通道集成

| 通道 | 状态 | 说明 |
|------|------|------|
| ✅ 微信 | 生产就绪 | 个人微信集成，支持消息收发 |
| ✅ 企业微信 | 生产就绪 | 企业通讯录同步 |
| ✅ Telegram | 生产就绪 | Bot API 集成 |
| ✅ Discord | 生产就绪 | Bot 权限管理 |
| 🚧 WhatsApp | 开发中 | Web.js 集成 |

---

## 📦 自定义 Skill 开发

```javascript
// skills/my-skill/SKILL.md - Skill 定义
---
name: my-skill
description: "自定义技能示例"
---

# My Skill

// skills/my-skill/index.js - Skill 实现
module.exports = {
  async execute(context, args) {
    return `Hello, ${args.name}!`;
  }
};
```

详细开发指南见 [SKILLS.md](docs/SKILLS.md)

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────┐
│                   用户终端                             │
│  微信 │ Telegram │ Discord │ Web 控制台              │
└──────────────────────┬──────────────────────────────┘
                       │ WebSocket
┌──────────────────────▼──────────────────────────────┐
│               OpenClaw Gateway                        │
│  认证  │  路由  │  限流  │  会话管理  │  日志审计      │
└──────┬───────────────────────────────────┬───────────┘
       │                                   │
┌──────▼──────┐                 ┌─────────▼──────────┐
│  AI 模型层    │                 │   Skill 插件层       │
│ DeepSeek/GPT │                 │  天气 │ 待办 │ 日历   │
│ Claude/Kimi  │                 │  自定义 Skill        │
└──────┬───────┘                 └─────────┬──────────┘
       │                                   │
┌──────▼───────────────────────────────────▼──────────┐
│                 数据持久层                            │
│  会话存储 │ 用户偏好 │ 知识图谱 │ 备份归档            │
└─────────────────────────────────────────────────────┘
```

---

## 📊 性能指标

| 指标 | 数据 |
|------|------|
| ⚡ 首次响应时间 | < 500ms |
| 🔄 宕机恢复时间 | < 30s |
| 🎯 系统可用性 | 99.9% |
| 📈 并发连接数 | 1000+ |
| 💾 内存占用 | < 200MB |

---

## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE)

## 🙏 致谢

- [OpenClaw](https://openclaw.ai) - 开源 AI Agent 框架
- [DeepSeek](https://deepseek.com) - 大语言模型支持
- 所有贡献者和使用者

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/superLDA">superLDA</a></sub>
</div>
