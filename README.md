# 🦞 OpenClaw × MiMo Enterprise Kit

> **基于小米 MiMo 大模型的企业级 AI 助手快速部署框架**  
> 集成 Xiaomi MiMo API | 一键部署 | 自恢复 | 多平台 | 开源

[![GitHub stars](https://img.shields.io/github/stars/superLDA/openclaw-enterprise-kit?style=social)](https://github.com/superLDA/openclaw-enterprise-kit)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MiMo](https://img.shields.io/badge/Powered%20by-Xiaomi%20MiMo-FF6900)](https://mimo.xiaomi.com)
[![OpenClaw](https://img.shields.io/badge/Built%20with-OpenClaw-00B4D8)](https://openclaw.ai)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/superLDA/openclaw-enterprise-kit/pulls)

---

## 🌟 项目亮点

本项目是 **小米 MiMo (ORBIT 开源计划)** 与 **OpenClaw 框架** 的深度结合，打造企业级 AI 助手。

| 特性 | 说明 |
|------|------|
| 🎯 **原生集成 MiMo API** | 直接调用 Xiaomi MiMo 系列大模型（MiMo-V2-Pro / MiMo-V2-Flash / Omni） |
| 🚀 **一键部署** | 支持 Windows/Linux/macOS，30 秒启动 |
| 🔄 **自恢复机制** | 多层看门狗守护 + 端口检测 + 定时自愈 |
| 🔌 **多平台集成** | 微信、Telegram、Discord、WhatsApp 全通道覆盖 |
| 🧩 **可扩展 Skill** | 即装即用的技能系统，支持自定义开发 |
| 🔒 **本地私有化部署** | 数据不出门，完全掌控 |

---

## 📋 项目结构

```
openclaw-enterprise-kit/
├── deploy/                  # 一键部署脚本
│   ├── setup.bat           # Windows 一键安装
│   ├── setup.sh            # Linux/macOS 一键安装  
│   └── watchdog.cmd        # 看门狗守护脚本
├── mimo/                    # MiMo 专用集成
│   ├── config.js            # MiMo API 配置
│   ├── mimo-skill.js        # MiMo 模型调用 Skill
│   └── proxy.js             # API 代理 / 负载均衡
├── config/                  # 配置文件
│   ├── openclaw.json        # OpenClaw 主配置
│   └── mimo-models.json     # MiMo 模型路由
├── skills/                  # Custom Skills
│   ├── README.md            # Skill 开发指南
│   ├── weather/             # 天气查询示例
│   └── todo/                # 待办事项示例
├── docs/                    # 完整文档
│   ├── QUICKSTART.md        # 快速入门
│   ├── MIMO_INTEGRATION.md  # MiMo 集成指南
│   ├── DEPLOY.md            # 部署指南
│   ├── SKILLS.md            # Skill 开发
│   └── TROUBLESHOOT.md      # 故障排除
├── scripts/                 # 管理工具
│   ├── health-check.cmd     # 健康检查
│   ├── auto-restart.cmd     # 自动重启
│   └── backup.js            # 数据备份
├── .github/workflows/       # CI 流水线
├── README.md                # 本文件
├── LICENSE                  # MIT 许可证
└── package.json             # 项目配置
```

---

## 🚀 快速开始

### 前提条件

- **Node.js** ≥ 18.x（[下载](https://nodejs.org/)）
- **npm**（随 Node.js 安装）
- **小米 MiMo API Key**（在 [mimo.xiaomi.com](https://mimo.xiaomi.com) 注册获取）

### Windows 一键部署

```powershell
git clone https://github.com/superLDA/openclaw-enterprise-kit.git
cd openclaw-enterprise-kit
.\deploy\setup.bat
```

### 配置 MiMo API Key

部署完成后，配置你的 MiMo API：

```bash
# 方式一：交互式配置
openclaw configure

# 方式二：直接编辑配置文件
# 编辑 config/mimo-models.json，填入你的 API Key
```

### 启动验证

```bash
# 验证系统健康
.\scripts\health-check.cmd

# 测试 MiMo 模型调用
node mimo/mimo-skill.js --test
```

---

## 🎯 小米 MiMo 深度集成

### 支持的 MiMo 模型

| 模型 | 用途 | 特点 |
|------|------|------|
| MiMo-V2-Pro | 日常对话 + 编程 | 性价比最优 |
| MiMo-V2-Flash | 快速推理 | 低延迟 7B 小模型 |
| MiMo-Omni | 多模态（图片理解） | 图片输入 |
| MiMo-TTS | 语音合成 | 文字转语音 |

### MiMo API 调用示例

```javascript
// 在 OpenClaw 中直接调用 MiMo
const response = await openclaw.infer({
  model: 'mimo-v2-pro',
  messages: [
    { role: 'user', content: '用 Python 写一个快速排序' }
  ]
});
console.log(response.content); // MiMo 生成的代码
```

### ORBIT 开源计划适配

本项目完全兼容小米 ORBIT 开源生态：
- ✅ 基于 MiMo-V2 系列模型
- ✅ 支持 MiMo 函数调用 / 工具使用
- ✅ 支持 Multi-Turn 多轮对话
- ✅ 支持流式输出 (SSE)
- ✅ 兼容 HuggingFace 开源模型部署

---

## 🔧 核心架构

```
┌──────────────────────────────────────────────────────────┐
│                    用户终端                                 │
│  微信 │ 企业微信 │ Telegram │ Discord │ Web 控制台        │
└────────────────────────┬─────────────────────────────────┘
                         │ WebSocket
┌────────────────────────▼─────────────────────────────────┐
│                  OpenClaw Gateway                          │
│   认证  │  路由  │  限流  │  会话管理  │  日志审计         │
└────────┬─────────────────────────────────────┬────────────┘
         │                                     │
┌────────▼──────────┐            ┌─────────────▼──────────┐
│   AI 模型层        │            │   Skill 插件层          │
│  MiMo-V2-Pro      │            │   天气 │ 待办 │ 日历    │
│  MiMo-V2-Flash    │            │   自定义 Skill          │
│  MiMo-Omni        │            │   第三方 API 集成       │
└────────┬──────────┘            └─────────────┬──────────┘
         │                                     │
┌────────▼─────────────────────────────────────▼──────────┐
│                     数据持久层                            │
│   会话存储 │ 用户偏好 │ 记忆图谱 │ 本地备份                │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 看门狗自恢复架构

```
┌──────────────────────────────────────────────────────────┐
│              OpenClaw × MiMo 自恢复系统                    │
├──────────────────────────────────────────────────────────┤
│  第一层: 系统定时任务 (schtasks RestartOnFailure)          │
│    → 进程崩溃后 1 分钟内自动拉起                           │
├──────────────────────────────────────────────────────────┤
│  第二层: 看门狗进程 (30秒端口检测)                         │
│    → 端口 18789 无响应时立即重启                           │
├──────────────────────────────────────────────────────────┤
│  第三层: 自愈定时任务 (5分钟健康检查)                       │
│    → 修复配置文件异常                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 🤝 贡献指南

欢迎参与 MiMo 开源生态建设：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feat/mimo-integration`)
3. 提交改动 (`git commit -m 'feat: add mimo streaming support'`)
4. 推送到分支 (`git push origin feat/mimo-integration`)
5. 提交 Pull Request

**建议贡献方向：**
- 添加更多 MiMo 模型支持
- 优化 MiMo API 调用效率
- 添加语音 / 多模态功能
- 完善文档和示例

---

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE)

## 🙏 致谢

- [Xiaomi MiMo](https://mimo.xiaomi.com) - 小米大模型平台
- [OpenClaw](https://openclaw.ai) - 开源 AI Agent 框架
- 小米 ORBIT 开源计划

---

<div align="center">
  <sub>Built with ❤️ for Xiaomi MiMo ORBIT Open Source Plan by <a href="https://github.com/superLDA">superLDA</a></sub>
  <br/>
  <sub>参与小米百亿 Token 计划，共建大模型开源生态</sub>
</div>
