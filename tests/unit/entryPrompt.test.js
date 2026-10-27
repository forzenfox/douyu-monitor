import { describe, it, expect, vi, afterEach } from 'vitest';
import { createEntryPrompt } from '@/entryPrompt.js';

const $ = selector => document.querySelector(selector);
const $all = selector => document.querySelectorAll(selector);

const startPrompt = () => {
  const result = { value: undefined, settled: false };
  const promise = createEntryPrompt().then(v => {
    result.value = v;
    result.settled = true;
    return v;
  });
  return { promise, result };
};

describe('createEntryPrompt 两步入口弹窗', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('第一步同时展示「团播看板」与「通用监控」两个入口', () => {
    startPrompt();

    expect($('.entry-modal')).not.toBeNull();
    expect($('.entry-option--lvjiang').textContent).toContain('驴酱青春团');
    expect($('.entry-option--monitor').textContent).toContain('通用监控');
    // 房间号输入框此时不可见
    expect($('.entry-step--rid').style.display).toBe('none');
  });

  it('点击团播入口直接返回 { type: "lvjiang" } 并关闭弹窗', async () => {
    const { promise, result } = startPrompt();

    $('.entry-option--lvjiang').click();
    await promise;

    expect(result.value).toEqual({ type: 'lvjiang' });
    expect($('.entry-modal')).toBeNull();
  });

  it('点击通用入口进入第二步房间号输入', () => {
    startPrompt();

    $('.entry-option--monitor').click();

    expect($('.entry-step--rid').style.display).not.toBe('none');
    expect($('.entry-title').textContent).toContain('请输入真实房间号');
    expect($('.entry-input')).not.toBeNull();
  });

  it('第二步点击「返回」可回到第一步', () => {
    startPrompt();

    $('.entry-option--monitor').click();
    $('.entry-back').click();

    expect($('.entry-step--rid').style.display).toBe('none');
    expect($('.entry-title').textContent).toContain('请选择进入的页面');
  });

  it('第二步输入房间号点「确定」返回 { type: "monitor", rid }', async () => {
    const { promise, result } = startPrompt();

    $('.entry-option--monitor').click();
    $('.entry-input').value = '  12345  ';
    $('.entry-confirm').click();
    await promise;

    expect(result.value).toEqual({ type: 'monitor', rid: '12345' });
    expect($('.entry-modal')).toBeNull();
  });

  it('第二步输入房间号后按回车同样生效', async () => {
    const { promise, result } = startPrompt();

    $('.entry-option--monitor').click();
    const input = $('.entry-input');
    input.value = '88888';
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    await promise;

    expect(result.value).toEqual({ type: 'monitor', rid: '88888' });
  });

  it('第二步房间号为空时不提交，弹窗保持打开', async () => {
    const { promise, result } = startPrompt();

    $('.entry-option--monitor').click();
    $('.entry-confirm').click();
    await Promise.resolve();

    expect(result.settled).toBe(false);
    expect($('.entry-modal')).not.toBeNull();
    expect($('.entry-step--rid').style.display).not.toBe('none');

    // 提示用户必须输入
    expect($('.entry-error').textContent.trim()).not.toBe('');

    // 后续仍可正常提交，避免弹窗被卡死
    $('.entry-input').value = '666';
    $('.entry-confirm').click();
    await promise;
    expect(result.value).toEqual({ type: 'monitor', rid: '666' });
  });

  it('第一步点「取消」返回 null 并关闭弹窗', async () => {
    const { promise, result } = startPrompt();

    $('.entry-cancel').click();
    await promise;

    expect(result.value).toBeNull();
    expect($('.entry-modal')).toBeNull();
  });

  it('按 ESC 返回 null 并关闭弹窗', async () => {
    const { promise, result } = startPrompt();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await promise;

    expect(result.value).toBeNull();
    expect($('.entry-modal')).toBeNull();
  });

  it('弹窗关闭后不再响应 ESC（监听已清理）', async () => {
    const { promise } = startPrompt();

    $('.entry-option--lvjiang').click();
    await promise;

    const removeChild = vi.spyOn(document.body, 'removeChild');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await Promise.resolve();

    expect(removeChild).not.toHaveBeenCalled();
    removeChild.mockRestore();
  });

  it('只允许同时存在一个入口弹窗', () => {
    startPrompt();
    startPrompt();

    expect($all('.entry-modal')).toHaveLength(1);
  });
});
