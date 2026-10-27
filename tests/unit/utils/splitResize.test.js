import { describe, it, expect } from 'vitest';
import {
  getVisibleModules,
  calcDragDelta,
  resolveResize,
  normalizeVisibleSizes,
  MIN_MODULE_SIZE,
} from '../../../src/monitor/utils/splitResize';

const ORDER = {
  enter: 0,
  gift: 1,
  danmaku: 2,
  superchat: 3,
  commandDanmaku: 4,
  userDanmaku: 5,
};

const DEFAULT_SIZE = {
  enter: 10,
  gift: 11,
  danmaku: 28,
  superchat: 17,
  commandDanmaku: 17,
  userDanmaku: 17,
};

describe('getVisibleModules', () => {
  it('按 order 升序返回已勾选的模块', () => {
    const options = {
      switch: ['danmaku', 'enter', 'gift'],
      order: {
        enter: 0,
        gift: 1,
        danmaku: 2,
        superchat: 3,
        commandDanmaku: 4,
        userDanmaku: 5,
      },
    };

    expect(getVisibleModules(options)).toEqual(['enter', 'gift', 'danmaku']);
  });

  it('默认配置下返回全部模块且顺序正确', () => {
    const options = {
      switch: [
        'enter',
        'gift',
        'danmaku',
        'superchat',
        'commandDanmaku',
        'userDanmaku',
      ],
      order: {
        enter: 0,
        gift: 1,
        danmaku: 2,
        superchat: 3,
        commandDanmaku: 4,
        userDanmaku: 5,
      },
    };

    expect(getVisibleModules(options)).toEqual([
      'enter',
      'gift',
      'danmaku',
      'superchat',
      'commandDanmaku',
      'userDanmaku',
    ]);
  });

  it('缺少配置时返回空数组', () => {
    expect(getVisibleModules(undefined)).toEqual([]);
    expect(getVisibleModules({})).toEqual([]);
  });
});

describe('calcDragDelta', () => {
  it('纵向布局按 Y 轴位移换算百分比', () => {
    const delta = calcDragDelta({
      startX: 0,
      startY: 100,
      x: 0,
      y: 150,
      direction: 'column',
      containerSize: 500,
    });

    expect(delta).toBe(10);
  });

  it('横向布局按 X 轴位移换算百分比', () => {
    const delta = calcDragDelta({
      startX: 100,
      startY: 0,
      x: 160,
      y: 0,
      direction: 'row',
      containerSize: 300,
    });

    expect(delta).toBe(20);
  });

  it('容器尺寸无效时返回 0', () => {
    expect(
      calcDragDelta({
        startX: 0,
        startY: 0,
        x: 0,
        y: 100,
        direction: 'column',
        containerSize: 0,
      })
    ).toBe(0);
  });
});

describe('resolveResize', () => {
  it('正向拖动时前一个模块变大，后一个模块变小，合计不变', () => {
    const result = resolveResize({ first: 60, second: 40, delta: 10 });

    expect(result).toEqual({ first: 70, second: 30 });
  });

  it('负向拖动时前一个模块变小，后一个模块变大', () => {
    const result = resolveResize({ first: 60, second: 40, delta: -10 });

    expect(result).toEqual({ first: 50, second: 50 });
  });

  it('前一个模块触达最小占比后不再缩小', () => {
    const result = resolveResize({ first: 5, second: 10, delta: -10 });

    expect(result.first).toBe(MIN_MODULE_SIZE);
    expect(result.first + result.second).toBe(15);
  });

  it('后一个模块触达最小占比后不再缩小', () => {
    const result = resolveResize({ first: 90, second: 10, delta: 20 });

    expect(result.second).toBe(MIN_MODULE_SIZE);
    expect(result.first + result.second).toBe(100);
  });

  it('占比本来已低于最小值时不强制抬高', () => {
    const result = resolveResize({ first: 0, second: 100, delta: -5 });

    expect(result).toEqual({ first: 0, second: 100 });
  });

  it('拖动下限固定为 5%', () => {
    expect(MIN_MODULE_SIZE).toBe(5);

    const result = resolveResize({ first: 50, second: 50, delta: 100 });
    expect(result.first).toBe(95);
    expect(result.second).toBe(5);
  });

  it('结果取整且合计保持不变', () => {
    const result = resolveResize({ first: 33.4, second: 66.6, delta: 0.7 });

    expect(Number.isInteger(result.first)).toBe(true);
    expect(Number.isInteger(result.second)).toBe(true);
    expect(result.first + result.second).toBe(100);
  });
});

describe('normalizeVisibleSizes', () => {
  it('全部模块可见且合计为 100 时保持不变', () => {
    const result = normalizeVisibleSizes({
      switch: Object.keys(DEFAULT_SIZE),
      size: { ...DEFAULT_SIZE },
      order: ORDER,
    });

    expect(result).toEqual(DEFAULT_SIZE);
  });

  it('部分模块隐藏时把可见模块占比放大到合计 100', () => {
    const result = normalizeVisibleSizes({
      switch: ['danmaku', 'userDanmaku'],
      size: { ...DEFAULT_SIZE },
      order: ORDER,
    });

    expect(result.danmaku).toBe(62);
    expect(result.userDanmaku).toBe(38);
    expect(result.danmaku + result.userDanmaku).toBe(100);
    // 隐藏模块的占比保留，便于重新勾选时恢复
    expect(result.gift).toBe(11);
  });

  it('只有一个可见模块时占比为 100', () => {
    const result = normalizeVisibleSizes({
      switch: ['userDanmaku'],
      size: { ...DEFAULT_SIZE },
      order: ORDER,
    });

    expect(result.userDanmaku).toBe(100);
  });

  it('可见模块占比全为 0 时平均分配并保证合计 100', () => {
    const result = normalizeVisibleSizes({
      switch: ['danmaku', 'superchat', 'userDanmaku'],
      size: {
        enter: 0,
        gift: 0,
        danmaku: 0,
        superchat: 0,
        commandDanmaku: 0,
        userDanmaku: 0,
      },
      order: ORDER,
    });

    const total = result.danmaku + result.superchat + result.userDanmaku;
    expect(total).toBe(100);
    expect(result.danmaku).toBeGreaterThan(0);
    expect(result.superchat).toBeGreaterThan(0);
    expect(result.userDanmaku).toBeGreaterThan(0);
  });

  it('四舍五入后可见模块合计仍为 100', () => {
    const result = normalizeVisibleSizes({
      switch: ['enter', 'gift', 'danmaku'],
      size: { ...DEFAULT_SIZE, enter: 33, gift: 33, danmaku: 33 },
      order: ORDER,
    });

    expect(result.enter + result.gift + result.danmaku).toBe(100);
  });
});
