import { describe, it, expect } from 'vitest';
import { useScroll } from '../../../src/monitor/hooks/useScroll';

describe('useScroll', () => {
  it('should initialize with isLock as false', () => {
    // 调用钩子函数
    const { isLock } = useScroll();

    // 验证初始状态
    expect(isLock.value).toBe(false);
  });

  it('should set isLock to false when no scrollbar', () => {
    // 调用钩子函数
    const { isLock, onScroll } = useScroll();

    // 模拟没有滚动条的DOM元素
    const mockDom = {
      scrollHeight: 100,
      clientHeight: 100,
      scrollTop: 0,
    };

    // 调用onScroll函数
    onScroll(mockDom);

    // 验证isLock状态
    expect(isLock.value).toBe(false); // 没有滚动条，不锁定
  });

  it('should set isLock to false when at bottom with scrollbar', () => {
    // 调用钩子函数
    const { isLock, onScroll } = useScroll();

    // 模拟有滚动条且在底部的DOM元素
    const mockDom = {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100, // 滚动到底部
    };

    // 调用onScroll函数
    onScroll(mockDom);

    // 验证isLock状态
    expect(isLock.value).toBe(false); // 在底部，不锁定
  });

  it('should set isLock to true when not at bottom with scrollbar', () => {
    // 调用钩子函数
    const { isLock, onScroll } = useScroll();

    // 模拟有滚动条且不在底部的DOM元素
    const mockDom = {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 50, // 不在底部
    };

    // 调用onScroll函数
    onScroll(mockDom);

    // 验证isLock状态
    expect(isLock.value).toBe(true); // 不在底部，锁定
  });

  it('should scroll to bottom when isLock is false', () => {
    // 调用钩子函数
    const { isLock, onScrollUpdate } = useScroll();

    // 确保isLock为false
    isLock.value = false;

    // 模拟DOM元素
    const mockDom = {
      scrollHeight: 200,
      scrollTop: 50,
    };

    // 调用onScrollUpdate函数
    onScrollUpdate(mockDom);

    // 验证是否滚动到底部
    expect(mockDom.scrollTop).toBe(200);
  });

  it('should not scroll to bottom when isLock is true', () => {
    // 调用钩子函数
    const { isLock, onScrollUpdate } = useScroll();

    // 设置isLock为true
    isLock.value = true;

    // 模拟DOM元素
    const mockDom = {
      scrollHeight: 200,
      scrollTop: 50,
    };

    // 调用onScrollUpdate函数
    onScrollUpdate(mockDom);

    // 验证是否没有滚动
    expect(mockDom.scrollTop).toBe(50); // 保持原位置
  });

  it('should scroll to bottom and unlock when goToScrollBottom is called', () => {
    // 调用钩子函数
    const { isLock, goToScrollBottom } = useScroll();

    // 设置isLock为true
    isLock.value = true;

    // 模拟DOM元素
    const mockDom = {
      scrollHeight: 200,
      scrollTop: 50,
    };

    // 调用goToScrollBottom函数
    goToScrollBottom(mockDom);

    // 验证是否滚动到底部且解锁
    expect(mockDom.scrollTop).toBe(200);
    expect(isLock.value).toBe(false);
  });
});
