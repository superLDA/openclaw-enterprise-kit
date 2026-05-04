/**
 * MiMo API Configuration
 * 
 * 小米 MiMo 大模型 API 配置
 * 支持 MiMo-V2-Pro / MiMo-V2-Flash / MiMo-Omni / MiMo-TTS
 * 
 * 使用方式:
 *   1. 在 mimo.xiaomi.com 注册获取 API Key
 *   2. 设置环境变量 MIMO_API_KEY 或编辑此文件
 *   3. 在 OpenClaw 中配置 MiMo 为默认模型
 */

// ============================================
// MiMo API 配置
// ============================================

const MIMO_CONFIG = {
  // API 基础地址
  baseUrl: 'https://api.mimo.xiaomi.com/v1',
  
  // API Key (推荐使用环境变量，不要在代码中硬编码)
  apiKey: process.env.MIMO_API_KEY || 'YOUR_MIMO_API_KEY_HERE',
  
  // 可用模型列表
  models: {
    // MiMo-V2-Pro: 通用对话 + 编程，性价比最优
    'mimo-v2-pro': {
      id: 'mimo-v2-pro',
      name: 'MiMo V2 Pro',
      description: '通用对话 / 编程 / 推理',
      maxTokens: 32768,
      pricing: '标准',
    },
    
    // MiMo-V2-Flash: 快速推理，低延迟
    'mimo-v2-flash': {
      id: 'mimo-v2-flash',
      name: 'MiMo V2 Flash',
      description: '快速推理 / 编码 / 数学',
      maxTokens: 32768,
      pricing: '经济',
    },
    
    // MiMo-Omni: 多模态，支持图片理解
    'mimo-omni': {
      id: 'mimo-omni',
      name: 'MiMo Omni',
      description: '多模态 / 图片理解 / 视觉分析',
      maxTokens: 65536,
      pricing: '高级',
    },
    
    // MiMo-TTS: 语音合成
    'mimo-tts': {
      id: 'mimo-tts',
      name: 'MiMo TTS',
      description: '语音合成 / 文字转语音',
      maxTokens: 4096,
      pricing: '标准',
    },
  },
  
  // 默认模型
  defaultModel: 'mimo-v2-pro',
  
  // 请求配置
  request: {
    timeout: 30000,       // 超时时间（毫秒）
    maxRetries: 3,        // 最大重试次数
    streamEnabled: true,  // 是否启用流式输出
  },
};

/**
 * 获取 MiMo API 配置
 */
function getConfig() {
  return { ...MIMO_CONFIG };
}

/**
 * 验证 API Key 配置
 */
function validateConfig() {
  const key = MIMO_CONFIG.apiKey;
  if (!key || key === 'YOUR_MIMO_API_KEY_HERE') {
    return {
      valid: false,
      error: 'MIMO_API_KEY 未配置。请设置环境变量或在 config.js 中填入你的 Key。',
      hint: '在 mimo.xiaomi.com 注册获取 API Key',
    };
  }
  return { valid: true };
}

/**
 * 获取指定模型的配置
 */
function getModelConfig(modelId) {
  return MIMO_CONFIG.models[modelId] || MIMO_CONFIG.models[MIMO_CONFIG.defaultModel];
}

module.exports = {
  getConfig,
  validateConfig,
  getModelConfig,
  MIMO_CONFIG,
};
