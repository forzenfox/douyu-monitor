/**
 * 文本转语音功能
 * @param {string} text - 要播报的文本
 * @param {number} rate - 语速，默认1
 */

// 语音播放状态管理
let isSpeaking = false;
let lastText = '';
let lastSpeakTime = 0;
const SPEAK_INTERVAL = 10 * 1000; // 相同文本最小播放间隔（毫秒）

/**
 * 重置语音播放状态（仅用于测试）
 */
export function resetSpeakState() {
  isSpeaking = false;
  lastText = '';
  lastSpeakTime = 0;
}

export function speakText(text, rate = 1) {
  // 检查浏览器是否支持语音合成
  if (!('speechSynthesis' in window)) {
    console.warn('浏览器不支持语音合成功能');
    return;
  }

  // 检查文本是否为空
  if (!text || text.trim() === '') {
    return;
  }

  // 去重：相同文本短时间内不重复播放
  const now = Date.now();
  if (text === lastText && now - lastSpeakTime < SPEAK_INTERVAL) {
    return;
  }

  // 更新最后播放时间和文本
  lastText = text;
  lastSpeakTime = now;

  // 移除了取消当前播放的逻辑，让语音可以排队播放
  // 浏览器的 speechSynthesis API 会自动处理播放队列，按顺序播放

  const speech = new SpeechSynthesisUtterance();
  // 设置播放内容
  speech.text = text;
  // 设置话语的音调(0-2 默认1，值越大越尖锐,越低越低沉)
  speech.pitch = 0.8;
  // 设置说话的速度(0.1-10 默认1，值越大语速越快,越小语速越慢)
  speech.rate = rate;
  // 设置说话的音量（0-1之间的有效值）
  speech.volume = 1.0;
  // 设置播放语言
  speech.lang = 'zh-CN';

  // 播放开始事件
  speech.onstart = () => {
    isSpeaking = true;
  };

  // 播放结束事件
  speech.onend = () => {
    isSpeaking = false;
  };

  // 播放错误事件
  speech.onerror = () => {
    isSpeaking = false;
  };

  // 加入播放队列
  window.speechSynthesis.speak(speech);
}
