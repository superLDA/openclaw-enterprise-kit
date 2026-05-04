# 故障排除指南

## 常见问题

### Q: Gateway 无法启动

**症状**: `openclaw gateway run` 无响应或立即退出

**排查**:
```bash
# 检查端口是否被占用
netstat -ano | findstr :18789

# 强制释放端口并重启
openclaw gateway run --port 18789 --force
```

### Q: 微信通道连接失败

**症状**: 扫码后无响应

**解决**:
```bash
# 重新登录
openclaw channels login --channel openclaw-weixin --verbose

# 检查通道状态
openclaw gateway status
```

### Q: 看门狗不工作

**症状**: Gateway 崩溃后没有自动重启

**解决**:
```bash
# 手动启动看门狗
start /B "" "%USERPROFILE%\.openclaw\watchdog.cmd"

# 检查看门狗是否运行
tasklist /fi "imagename eq cmd.exe" | findstr "watchdog"
```

### Q: API 返回 429 限流

**症状**: 请求返回 `负载已饱和`

**解决**:
- 等待 30-60 秒后重试
- 切换到其他模型
- 降低请求频率

### Q: 配置文件损坏

**症状**: Gateway 启动时报 JSON 解析错误

**解决**:
```bash
# 备份当前配置
copy "%USERPROFILE%\.openclaw\openclaw.json" "%USERPROFILE%\.openclaw\openclaw.json.bak"

# 重新初始化
openclaw setup
```

## 日志查看

```bash
# 查看 Gateway 日志
openclaw logs

# 查看健康检查日志
type "%USERPROFILE%\.openclaw\self-check.log"

# 查看看门狗日志
type "%USERPROFILE%\.openclaw\watchdog.log"
```
