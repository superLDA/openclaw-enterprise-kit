# MiMo API 集成指南

## 概述

本指南介绍如何在 OpenClaw 中集成小米 MiMo 大模型 API。

## 前提条件

1. 在 [mimo.xiaomi.com](https://mimo.xiaomi.com) 注册账号
2. 获取 MiMo API Key
3. 确保已订购 Token Plan（基础版即可）

## 快速配置

### 方式一：环境变量（推荐）

```bash
# Windows (PowerShell)
$env:MIMO_API_KEY = "你的_API_KEY"

# Linux/macOS
export MIMO_API_KEY="你的_API_KEY"
```

### 方式二：修改配置文件

编辑 `mimo/config.js`，将 `apiKey` 替换为你的 Key。

## OpenClaw 中配置 MiMo 模型

### 方法 1: 通过 openclaw configure 交互式配置

```bash
openclaw configure
```

选择 "添加自定义 Provider"，然后填入：
- **名称**: mimo
- **Base URL**: `https://api.mimo.xiaomi.com/v1`
- **API Key**: 你的 MiMo API Key

### 方法 2: 直接修改 openclaw.json

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "models": {
    "providers": {
      "mimo": {
        "baseUrl": "https://api.mimo.xiaomi.com/v1",
        "apiKey": "你的_API_KEY",
        "models": ["mimo-v2-pro", "mimo-v2-flash", "mimo-omni"]
      }
    },
    "defaults": {
      "chat": "mimo-v2-pro",
      "code": "mimo-v2-flash",
      "vision": "mimo-omni"
    }
  }
}
```

## 测试连接

```bash
# 测试 MiMo API
node mimo/mimo-skill.js --test

# 对话测试
node mimo/mimo-skill.js --chat "你好，介绍一下你自己"

# 编程测试
node mimo/mimo-skill.js --code "用Python写一个Web服务器"
```

## 支持的 API 端点

| 端点 | 说明 | 模型 |
|------|------|------|
| `/v1/chat/completions` | 对话补全 | 全部 |
| `/v1/models` | 模型列表 | - |
| `/v1/embeddings` | 文本嵌入 | 全部 |
| `/v1/audio/speech` | 语音合成 | MiMo-TTS |

## 最佳实践

1. **适量使用 Token**：设置 `max_tokens` 控制输出长度，避免浪费
2. **使用流式输出**：开启 `stream: true` 获得更快体验
3. **错误重试**：遇到限流(429)时，等待后重试
4. **选择合适模型**：简单任务用 Flash，复杂用 Pro
