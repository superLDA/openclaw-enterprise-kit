# OpenClaw Skill 开发指南

## Skill 是什么？

Skill 是 OpenClaw 的功能扩展模块，类似于 ChatGPT 的插件。通过 Skill 可以：
- 扩展 AI 助手的能力
- 接入外部 API 和服务
- 自定义业务逻辑

## 快速开始

### 创建你的第一个 Skill

```bash
mkdir -p skills/my-skill
cd skills/my-skill
```

创建 `SKILL.md`:

```markdown
---
name: my-skill
description: "我的第一个自定义 Skill"
---

# My Skill

这是一个示例 Skill，展示了基本结构。
```

创建 `index.js`:

```javascript
module.exports = {
  name: 'my-skill',
  
  async execute(context, args) {
    const { user, message } = context;
    return `你好 ${user}！你说了: ${message}`;
  },
  
  async onInstall() {
    console.log('Skill 已安装！');
  }
};
```

### 安装 Skill

```bash
openclaw skills install --local ./skills/my-skill
```

## Skill API 参考

### Context 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| user | string | 用户标识 |
| message | string | 用户消息 |
| channel | string | 消息通道 |
| timestamp | Date | 消息时间戳 |

### 生命周期钩子

| 钩子 | 触发时机 | 说明 |
|------|----------|------|
| onInstall | 安装时 | 初始化配置 |
| onUninstall | 卸载时 | 清理资源 |
| onMessage | 收到消息 | 处理用户输入 |
| onError | 发生错误 | 错误处理 |

### 内置 Skill 示例

### 天气查询 Skill

```markdown
---
name: weather
description: "查询天气信息"
---

# Weather Skill

使用 Open-Meteo API 查询天气。
```

### 待办事项 Skill

```markdown
---
name: todo
description: "简单的待办事项管理"
---

# Todo Skill

增删改查待办事项，支持本地存储。
```
