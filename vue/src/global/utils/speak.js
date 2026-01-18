/**
 * 文本转语音功能
 * @param {string} text - 要播报的文本
 * @param {number} rate - 语速，默认1
 */
export function speakText(text, rate = 1) {
    // 检查浏览器是否支持语音合成
    if (!('speechSynthesis' in window)) {
        console.warn('浏览器不支持语音合成功能');
        return;
    }
    
    const speech = new SpeechSynthesisUtterance();
    // 设置播放内容
    speech.text = text;
    // 设置话语的音调(0-2 默认1，值越大越尖锐,越低越低沉)
    speech.pitch = 0.8;
    // 设置说话的速度(0.1-10 默认1，值越大语速越快,越小语速越慢)
    speech.rate = rate;
    // 设置说话的音量
    speech.volume = 10;
    // 设置播放语言
    speech.lang = 'zh-CN';
    // 加入播放队列
    window.speechSynthesis.speak(speech);
}
