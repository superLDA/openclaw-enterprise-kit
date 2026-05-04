/**
 * MiMo API 技能模块
 * 完整支持 Chat Completions（流式与非流式）
 * 
 * 使用示例:
 *   const mimo = require('./mimo-skill')
 *   await mimo.chat('你好', { model: 'mimo-v2-pro' })
 */

const config = require('./config')
const https = require('https')
const http = require('http')

/**
 * 非流式聊天
 * @param {string|Array} messages - 消息内容或消息数组
 * @param {object} opts - 可选参数 { model, temperature, top_p, max_completion_tokens, stream, authMethod }
 * @returns {Promise<object>} { content, model, usage }
 */
async function chat(messages, opts = {}) {
  const model = opts.model || config.defaultModel
  const authMethod = opts.authMethod || 'api-key'
  
  // 根据模型调整默认参数
  const cfg = getModelDefaults(model)
  
  const body = JSON.stringify({
    model,
    messages: typeof messages === 'string' 
      ? [{ role: 'user', content: messages }] 
      : messages,
    temperature: opts.temperature ?? cfg.temperature,
    top_p: opts.top_p ?? cfg.top_p,
    max_completion_tokens: opts.max_completion_tokens ?? 1024,
    stream: false,
    frequency_penalty: opts.frequency_penalty ?? 0,
    presence_penalty: opts.presence_penalty ?? 0
  })

  const resp = await fetch(config.getChatUrl(), {
    method: 'POST',
    headers: {
      ...config.getHeaders(authMethod),
      'Content-Type': 'application/json'
    },
    body
  })

  if (!resp.ok) {
    const errText = await resp.text()
    const errMap = {
      400: '请求格式错误: 请检查JSON/模型名/参数',
      401: '认证失败: 检查API Key格式和有效性',
      402: `需要充值: 请前往 https://mimo.xiaomi.com 充值`,
      403: '被拒绝访问: API Key可能被限制',
      421: '检测到错误请求: 输入内容不安全',
      429: '请求过于频繁: 请降低调用频率或升级Token Plan',
      500: '服务器内部错误: 请稍后重试',
      503: '服务暂不可用: 服务器过载，请稍后重试'
    }
    const msg = errMap[resp.status] || `未知错误 (${resp.status})`
    throw new Error(`MiMo API ${resp.status}: ${msg}`)
  }

  const data = await resp.json()
  return {
    content: data.choices?.[0]?.message?.content || '',
    reasoning_content: data.choices?.[0]?.message?.reasoning_content || '',
    model: data.model || model,
    usage: data.usage || {}
  }
}

/**
 * 流式聊天（SSE）
 * @param {string|Array} messages
 * @param {object} opts - { model, temperature, max_tokens }
 * @param {function} onChunk - 每个 token 到达时回调 (text, done)
 * @returns {Promise<string>} 完整回复
 */
async function chatStream(messages, opts = {}, onChunk) {
  const model = opts.model || config.defaultModel
  
  const body = JSON.stringify({
    model,
    messages: typeof messages === 'string'
      ? [{ role: 'user', content: messages }]
      : messages,
    temperature: opts.temperature ?? 1.0,
    top_p: opts.top_p ?? 0.95,
    max_completion_tokens: opts.max_completion_tokens ?? 1024,
    stream: true,
    frequency_penalty: opts.frequency_penalty ?? 0,
    presence_penalty: opts.presence_penalty ?? 0
  })

  const url = new URL(config.getChatUrl())
  const fullText = []

  return new Promise((resolve, reject) => {
    const postData = body
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        ...config.getHeaders('api-key'),
        'Content-Type': 'application/json'
      }
    }

    const proto = url.protocol === 'https:' ? https : http
    const req = proto.request(options, (res) => {
      if (res.statusCode === 402) {
        reject(new Error(`MiMo API 402 需要充值 (${model}): 前往 mimo.xiaomi.com 充值`))
        return
      }

      let buffer = ''
      res.on('data', (chunk) => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            if (onChunk) onChunk('', true)
            resolve(fullText.join(''))
            return
          }
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content || ''
            if (delta) {
              fullText.push(delta)
              if (onChunk) onChunk(delta, false)
            }
          } catch { /* 忽略解析错误 */ }
        }
      })

      res.on('end', () => {
        if (onChunk) onChunk('', true)
        resolve(fullText.join(''))
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

/**
 * 各模型推荐参数
 */
function getModelDefaults(model) {
  const defaults = {
    'mimo-v2-flash':  { temperature: 0.3, top_p: 0.95 },
    'mimo-v2-pro':    { temperature: 1.0, top_p: 0.95 },
    'mimo-v2-omni':   { temperature: 1.0, top_p: 0.95 },
    'mimo-v2-tts':    { temperature: 0.6, top_p: 0.95 },
    'mimo-v2.5':      { temperature: 1.0, top_p: 0.95 },
    'mimo-v2.5-pro':  { temperature: 1.0, top_p: 0.95 },
    'mimo-v2.5-tts':  { temperature: 0.6, top_p: 0.95 },
    'mimo-v2.5-tts-voiceclone': { temperature: 0.6, top_p: 0.95 },
    'mimo-v2.5-tts-voicedesign': { temperature: 0.6, top_p: 0.95 }
  }
  return defaults[model] || { temperature: 1.0, top_p: 0.95 }
}

/**
 * 列出所有可用模型
 */
async function listModels() {
  const resp = await fetch(config.getModelsUrl(), {
    headers: config.getHeaders('api-key')
  })
  if (!resp.ok) throw new Error(`获取模型列表失败: ${resp.status}`)
  const data = await resp.json()
  return data.data || []
}

/**
 * 命令行测试入口
 */
if (require.main === module) {
  const testMsg = process.argv[2] || '你好，请回复"连接成功"四个字'
  const testModel = process.argv[3] || 'mimo-v2-pro'
  
  console.log(`\n🤖 MiMo API 测试`)
  console.log(`📡 API: ${config.baseUrl}`)
  console.log(`📝 输入: ${testMsg}`)
  console.log(`🎯 模型: ${testModel}\n`)
  
  chat(testMsg, { model: testModel })
    .then(r => {
      console.log(`✅ 回复: ${r.content}`)
      console.log(`📊 Token: 输入 ${r.usage?.prompt_tokens || '?'} / 输出 ${r.usage?.completion_tokens || '?'}`)
    })
    .catch(e => {
      console.log(`❌ 失败: ${e.message}`)
      if (e.message.includes('402')) {
        console.log(`💰 请在 https://mimo.xiaomi.com 充值后重试`)
      }
      process.exit(1)
    })
}

module.exports = { chat, chatStream, listModels, config }
