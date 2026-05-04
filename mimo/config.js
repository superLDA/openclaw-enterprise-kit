/**
 * MiMo API 配置
 * 小米 MiMo Token Plan 接入
 * https://api.xiaomimimo.com/v1
 */
class MiMoConfig {
  constructor() {
    this.baseUrl = 'https://api.xiaomimimo.com/v1'
    this.apiKey = process.env.MIMO_API_KEY || ''
    this.models = {
      'mimo-v2-flash':  { name: 'MiMo V2 Flash',     context: 128000 },
      'mimo-v2-pro':    { name: 'MiMo V2 Pro',       context: 128000 },
      'mimo-v2-omni':   { name: 'MiMo V2 Omni',      context: 128000 },
      'mimo-v2-tts':    { name: 'MiMo V2 TTS',       context: 128000 },
      'mimo-v2.5':      { name: 'MiMo V2.5',         context: 256000 },
      'mimo-v2.5-pro':  { name: 'MiMo V2.5 Pro',     context: 256000 },
      'mimo-v2.5-tts':  { name: 'MiMo V2.5 TTS',     context: 256000 },
      'mimo-v2.5-tts-voiceclone': { name: 'MiMo V2.5 TTS 声音克隆', context: 256000 },
      'mimo-v2.5-tts-voicedesign': { name: 'MiMo V2.5 TTS 声音设计', context: 256000 }
    }
    this.defaultModel = 'mimo-v2-pro'
  }

  getConfig() {
    return {
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      models: this.models,
      defaultModel: this.defaultModel
    }
  }

  getChatUrl() {
    return `${this.baseUrl}/chat/completions`
  }

  getModelsUrl() {
    return `${this.baseUrl}/models`
  }

  getHeaders(authMethod = 'api-key') {
    const headers = { 'Content-Type': 'application/json' }
    if (authMethod === 'api-key') {
      headers['api-key'] = this.apiKey
    } else {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }
    return headers
  }
}

module.exports = new MiMoConfig()
