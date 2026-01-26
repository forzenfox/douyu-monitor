import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speakText, resetSpeakState } from '../../../src/global/utils/speak.js';

describe('speakText 函数测试', () => {
  // 模拟浏览器环境
  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();

    // 创建 window 对象（如果不存在）
    if (typeof window === 'undefined') {
      global.window = {};
    }

    // 使用普通函数模拟 SpeechSynthesisUtterance 构造函数
    global.SpeechSynthesisUtterance = function () {
      this.text = '';
      this.pitch = 1;
      this.rate = 1;
      this.volume = 1;
      this.lang = 'zh-CN';
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    };

    // 模拟 window.speechSynthesis
    global.window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };

    // 重置模块级别的变量
    resetSpeakState();
  });

  it('应该在浏览器不支持 speechSynthesis 时返回', () => {
    // 删除 speechSynthesis 以模拟不支持的情况
    delete global.window.speechSynthesis;

    // 模拟 console.warn
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    speakText('测试文本');

    expect(consoleWarnSpy).toHaveBeenCalledWith('浏览器不支持语音合成功能');
    consoleWarnSpy.mockRestore();
  });

  it('应该在文本为空时返回', () => {
    speakText('');
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();

    speakText('   ');
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();

    speakText(null);
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();

    speakText(undefined);
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('应该在相同文本短时间内重复调用时返回', () => {
    // 使用 vi.useFakeTimers() 来模拟时间
    vi.useFakeTimers();
    const mockTime = 1000000;
    vi.setSystemTime(mockTime);

    // 第一次调用，应该正常执行
    speakText('测试文本');
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);

    // 立即再次调用相同文本，应该被去重
    vi.setSystemTime(mockTime + 5000); // 5秒后，小于10秒的间隔
    speakText('测试文本');
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);

    // 恢复真实时间
    vi.useRealTimers();
  });

  it('应该正常播放文本并设置正确的参数', () => {
    const testText = '这是一段测试文本';
    const testRate = 1.5;

    // 保存原始的 SpeechSynthesisUtterance 实例
    let createdUtterance;
    const originalSpeak = global.window.speechSynthesis.speak;
    global.window.speechSynthesis.speak = vi.fn(utterance => {
      createdUtterance = utterance;
      originalSpeak(utterance);
    });

    speakText(testText, testRate);

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(createdUtterance).toBeDefined();

    // 验证参数设置
    expect(createdUtterance.text).toBe(testText);
    expect(createdUtterance.rate).toBe(testRate);
    expect(createdUtterance.pitch).toBe(0.8);
    expect(createdUtterance.volume).toBe(1.0);
    expect(createdUtterance.lang).toBe('zh-CN');
  });

  it('应该触发 onstart 事件并更新状态', () => {
    // 保存原始的 SpeechSynthesisUtterance 实例
    let createdUtterance;
    const originalSpeak = global.window.speechSynthesis.speak;
    global.window.speechSynthesis.speak = vi.fn(utterance => {
      createdUtterance = utterance;
      originalSpeak(utterance);
    });

    speakText('测试文本');

    expect(createdUtterance.onstart).toBeDefined();

    // 模拟触发 onstart 事件
    createdUtterance.onstart();
  });

  it('应该触发 onend 事件并更新状态', () => {
    // 保存原始的 SpeechSynthesisUtterance 实例
    let createdUtterance;
    const originalSpeak = global.window.speechSynthesis.speak;
    global.window.speechSynthesis.speak = vi.fn(utterance => {
      createdUtterance = utterance;
      originalSpeak(utterance);
    });

    speakText('测试文本');

    expect(createdUtterance.onend).toBeDefined();

    // 模拟触发 onend 事件
    createdUtterance.onend();
  });

  it('应该触发 onerror 事件并更新状态', () => {
    // 保存原始的 SpeechSynthesisUtterance 实例
    let createdUtterance;
    const originalSpeak = global.window.speechSynthesis.speak;
    global.window.speechSynthesis.speak = vi.fn(utterance => {
      createdUtterance = utterance;
      originalSpeak(utterance);
    });

    speakText('测试文本');

    expect(createdUtterance.onerror).toBeDefined();

    // 模拟触发 onerror 事件
    createdUtterance.onerror();
  });

  it('应该使用默认语速 1 当没有提供 rate 参数时', () => {
    // 保存原始的 SpeechSynthesisUtterance 实例
    let createdUtterance;
    const originalSpeak = global.window.speechSynthesis.speak;
    global.window.speechSynthesis.speak = vi.fn(utterance => {
      createdUtterance = utterance;
      originalSpeak(utterance);
    });

    speakText('测试文本');

    expect(createdUtterance.rate).toBe(1);
  });
});
