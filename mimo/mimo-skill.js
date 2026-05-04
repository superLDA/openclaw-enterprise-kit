#!/usr/bin/env node

/**
 * MiMo Model Skill for OpenClaw
 * 
 * 在 OpenClaw 中直接调用小米 MiMo 大模型
 * 支持 MiMo-V2-Pro / MiMo-V2-Flash / MiMo-Omni
 * 
 * 用法:
 *   node mimo/mimo-skill.js --test          # 测试连接
 *   node mimo/mimo-skill.js --chat "你好"    # 对话
 *   node mimo/mimo-skill.js --code "写一个排序"  # 编程
 */

const https = require('https');
const http = require('http');
const { getConfig, validateConfig, getModelConfig } = require('./config.js');

// ============================================
// MiMo API 调用核心
// ============================================

class MiMoClient {
  constructor() {
    const config = getConfig();
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel;
    this.timeout = config.request.timeout;
    this.maxRetries = config.request.maxRetries;

    const validation = validateConfig();
    if (!validation.valid) {
      console.warn(`\n⚠️  ${validation.error}`);
      console.warn(`💡  ${validation.hint}\n`);
    }
  }

  /**
   * 发送对话请求
   */
  async chat(messages, options = {}) {
    const model = options.model || this.defaultModel;
    const url = new URL('/chat/completions', this.baseUrl);

    const body = JSON.stringify({
      model: model,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: options.stream ?? false,
    });

    return this._request(url.toString(), body);
  }

  /**
   * 流式对话（SSE）
   */
  async chatStream(messages, onChunk, options = {}) {
    const model = options.model || this.defaultModel;
    const url = new URL('/chat/completions', this.baseUrl);

    const body = JSON.stringify({
      model: model,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true,
    });

    return this._streamRequest(url.toString(), body, onChunk);
  }

  /**
   * HTTP POST 请求（非流式）
   */
  _request(url, body) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'OpenClaw-Enterprise-Kit/1.0',
        },
        timeout: this.timeout,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error [${res.statusCode}]: ${parsed.error?.message || data}`));
            }
          } catch (e) {
            reject(new Error(`Parse Error: ${e.message}. Raw: ${data.slice(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request Timeout')); });
      req.write(body);
      req.end();
    });
  }

  /**
   * HTTP POST 请求（流式 SSE）
   */
  _streamRequest(url, body, onChunk) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream',
          'User-Agent': 'OpenClaw-Enterprise-Kit/1.0',
        },
        timeout: this.timeout + 30000,
      }, (res) => {
        let buffer = '';
        let fullContent = '';

        res.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  onChunk?.(content, fullContent);
                }
              } catch { /* skip parse errors */ }
            }
          }
        });

        res.on('end', () => resolve(fullContent));
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Stream Timeout')); });
      req.write(body);
      req.end();
    });
  }
}

// ============================================
// 命令行入口
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const client = new MiMoClient();

  if (args.includes('--test')) {
    console.log('\n🔍 测试 MiMo API 连接...\n');
    try {
      const result = await client.chat([
        { role: 'user', content: '回复"连接成功"四个字即可' }
      ], { maxTokens: 10 });
      
      const reply = result.choices?.[0]?.message?.content || '无响应';
      console.log(`✅ MiMo API 连接成功！`);
      console.log(`📝 响应: ${reply}`);
      console.log(`⚡ 模型: ${result.model}`);
      console.log(`📊 Token: ${result.usage?.total_tokens || 'N/A'}`);
    } catch (e) {
      console.error(`❌ 连接失败: ${e.message}`);
      process.exit(1);
    }
  }

  if (args.includes('--chat')) {
    const idx = args.indexOf('--chat');
    const message = args[idx + 1] || '你好';
    
    console.log(`\n💬 发送消息: ${message}\n`);
    
    try {
      const result = await client.chat([
        { role: 'user', content: message }
      ]);
      
      const reply = result.choices?.[0]?.message?.content || '无响应';
      console.log(`🤖 MiMo: ${reply}`);
      console.log(`\n📊 Token: ${result.usage?.total_tokens || 'N/A'}`);
    } catch (e) {
      console.error(`❌ 请求失败: ${e.message}`);
    }
  }

  if (args.includes('--code')) {
    const idx = args.indexOf('--code');
    const prompt = args[idx + 1] || '写一个计算斐波那契数列的函数';
    
    console.log(`\n💻 编程请求: ${prompt}\n`);
    console.log('🤖 MiMo 生成中...\n');
    
    try {
      await client.chatStream(
        [{ role: 'user', content: `请用 JavaScript 实现：${prompt}，仅输出代码，不要解释` }],
        (chunk, full) => {
          // 清除行并输出最新内容
          process.stdout.write('\r\x1b[K');
          process.stdout.write(`📝 ${full.slice(-80)}`);
        },
        { model: 'mimo-v2-flash' }
      );
      console.log('\n\n✅ 生成完成！');
    } catch (e) {
      console.error(`\n❌ 请求失败: ${e.message}`);
    }
  }

  // 如果没有参数，显示帮助
  if (!args.length) {
    console.log(`
🦞 OpenClaw × MiMo Enterprise Kit

用法:
  node mimo/mimo-skill.js --test          测试 MiMo API 连接
  node mimo/mimo-skill.js --chat "消息"   对话
  node mimo/mimo-skill.js --code "需求"   编程助手

配置:
  设置环境变量 MIMO_API_KEY 或在 config.js 中填入
    `);
  }
}

main().catch(console.error);
