import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRandom,
  getStrMiddle,
  saveLocalData,
  getLocalData,
  deepCopy,
  getClassStyle,
  formatObj,
  exportFile,
  getNowDate,
  isIE,
} from '@/global/utils/index.js';

describe('Utils Functions', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn(key => store[key] || null),
      setItem: vi.fn((key, value) => (store[key] = value.toString())),
      clear: vi.fn(() => (store = {})),
    };
  })();

  beforeEach(() => {
    // 重置localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // 重置URL.createObjectURL和URL.revokeObjectURL
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // 重置document.createElement和click方法
    const mockClick = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    });
  });

  describe('getRandom', () => {
    it('should generate random number within specified range', () => {
      const min = 1;
      const max = 10;
      const result = getRandom(min, max);

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should return min when min equals max', () => {
      const min = 5;
      const max = 5;
      const result = getRandom(min, max);
      expect(result).toBe(min);
    });

    it('should handle negative numbers', () => {
      const min = -10;
      const max = -1;
      const result = getRandom(min, max);

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('getStrMiddle', () => {
    it('should return string between two specified strings', () => {
      const str = 'Hello [world]!';
      const before = '[';
      const after = ']';
      const result = getStrMiddle(str, before, after);
      expect(result).toBe('world');
    });

    it('should return false when before string is not found', () => {
      const str = 'Hello world!';
      const before = '[';
      const after = ']';
      const result = getStrMiddle(str, before, after);
      expect(result).toBe(false);
    });

    it('should return false when after string is not found', () => {
      const str = 'Hello [world!';
      const before = '[';
      const after = ']';
      const result = getStrMiddle(str, before, after);
      expect(result).toBe(false);
    });

    it('should handle multiple occurrences correctly', () => {
      const str = 'Hello [world] and [everyone]!';
      const before = '[';
      const after = ']';
      const result = getStrMiddle(str, before, after);
      expect(result).toBe('world'); // 应该只返回第一个匹配
    });
  });

  describe('saveLocalData and getLocalData', () => {
    it('should save and retrieve data from localStorage', () => {
      const name = 'testKey';
      const data = 'testValue';

      saveLocalData(name, data);
      expect(localStorage.setItem).toHaveBeenCalledWith(name, data);

      const result = getLocalData(name);
      expect(localStorage.getItem).toHaveBeenCalledWith(name);
      expect(result).toBe(data);
    });

    it('should return null when data is not found', () => {
      const result = getLocalData('nonExistentKey');
      expect(localStorage.getItem).toHaveBeenCalledWith('nonExistentKey');
      expect(result).toBe(null);
    });

    it('should handle number data correctly', () => {
      const name = 'testNumber';
      const data = 123;

      saveLocalData(name, data);
      expect(localStorage.setItem).toHaveBeenCalledWith(name, data);

      const result = getLocalData(name);
      expect(result).toBe('123'); // localStorage存储的是字符串
    });
  });

  describe('deepCopy', () => {
    it('should create a deep copy of an object', () => {
      const original = {
        name: 'test',
        nested: { value: 123 },
        array: [1, 2, 3],
      };

      const copy = deepCopy(original);

      // 深拷贝应该是不同的对象引用
      expect(copy).not.toBe(original);
      expect(copy.nested).not.toBe(original.nested);
      expect(copy.array).not.toBe(original.array);

      // 深拷贝应该有相同的值
      expect(copy).toEqual(original);

      // 修改原始对象不应该影响拷贝
      original.nested.value = 456;
      original.array.push(4);

      expect(copy.nested.value).toBe(123);
      expect(copy.array).toEqual([1, 2, 3]);
    });

    it('should handle primitive values correctly', () => {
      expect(deepCopy(123)).toBe(123);
      expect(deepCopy('string')).toBe('string');
      expect(deepCopy(true)).toBe(true);
      expect(deepCopy(null)).toBe(null);
      expect(deepCopy(undefined)).toBe(undefined);
    });

    it('should handle array correctly', () => {
      const original = [1, 2, { nested: 3 }];
      const copy = deepCopy(original);

      expect(copy).not.toBe(original);
      expect(copy).toEqual(original);

      original[2].nested = 4;
      expect(copy[2].nested).toBe(3);
    });
  });

  describe('getClassStyle', () => {
    it('should get computed style for modern browsers', () => {
      const mockDom = {
        currentStyle: null,
      };

      const mockComputedStyle = {
        color: 'red',
      };

      vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue(
        mockComputedStyle
      );

      const result = getClassStyle(mockDom, 'color');
      expect(result).toBe('red');
      expect(document.defaultView.getComputedStyle).toHaveBeenCalledWith(
        mockDom,
        null
      );
    });

    it('should get currentStyle for older IE browsers', () => {
      const mockDom = {
        currentStyle: {
          color: 'blue',
        },
      };

      const result = getClassStyle(mockDom, 'color');
      expect(result).toBe('blue');
    });

    it('should handle backgroundPosition for older IE browsers with separate properties', () => {
      // 测试IE环境下，backgroundPositionX和backgroundPositionY的处理
      const mockDom = {
        currentStyle: {
          backgroundPositionX: '10px',
          backgroundPositionY: '20px',
        },
      };

      // 设置window.__IE_MODE__为true，强制使用IE模式
      window.__IE_MODE__ = true;

      // 测试backgroundPosition属性
      const result = getClassStyle(mockDom, 'backgroundPosition');
      expect(result).toBe('10px 20px');

      // 恢复window.__IE_MODE__
      delete window.__IE_MODE__;
    });

    it('should handle backgroundPosition for older IE browsers with combined property', () => {
      const mockDom = {
        currentStyle: {
          backgroundPosition: '10px 20px',
        },
      };

      const result = getClassStyle(mockDom, 'backgroundPosition');
      expect(result).toBe('10px 20px');
    });

    it('should handle backgroundPosition for modern browsers', () => {
      const mockDom = {
        currentStyle: null,
      };

      const mockComputedStyle = {
        backgroundPosition: '30px 40px',
      };

      vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue(
        mockComputedStyle
      );

      const result = getClassStyle(mockDom, 'backgroundPosition');
      expect(result).toBe('30px 40px');
    });
  });

  describe('formatObj', () => {
    it('should format object according to template', () => {
      const obj = {
        name: 'test',
        age: 25,
      };

      const template = {
        name: '',
        age: 0,
        email: '',
      };

      const result = formatObj(obj, template);

      expect(result).toEqual({
        name: 'test',
        age: 25,
        email: '',
      });
    });

    it('should recursively format nested objects', () => {
      const obj = {
        name: 'test',
        nested: {
          value: 123,
        },
      };

      const template = {
        name: '',
        nested: {
          value: 0,
          extra: '',
        },
        email: '',
      };

      const result = formatObj(obj, template);

      expect(result).toEqual({
        name: 'test',
        nested: {
          value: 123,
          extra: '',
        },
        email: '',
      });
    });

    it('should return empty object when template is empty', () => {
      const obj = {
        name: 'test',
        age: 25,
      };

      const template = {};

      const result = formatObj(obj, template);
      expect(result).toEqual({});
    });

    it('should return template when obj is empty', () => {
      const obj = {};

      const template = {
        name: '',
        age: 0,
      };

      const result = formatObj(obj, template);
      expect(result).toEqual(template);
    });
  });

  describe('exportFile', () => {
    it('should export file correctly', () => {
      const filename = 'test.txt';
      const filecontent = 'Test content';

      exportFile(filename, filecontent);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should handle empty file content', () => {
      const filename = 'empty.txt';
      const filecontent = '';

      exportFile(filename, filecontent);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('getNowDate', () => {
    it('should return formatted date string', () => {
      // 固定时间为2023-01-01 12:34:56
      const fixedDate = new Date('2023-01-01T12:34:56');
      vi.spyOn(Date, 'now').mockReturnValue(fixedDate.getTime());
      vi.useFakeTimers();
      vi.setSystemTime(fixedDate);

      const result = getNowDate();
      // 修复了bug，分钟现在正确显示
      expect(result).toBe('2023-01-01 12-34-56');

      vi.useRealTimers();
    });

    it('should handle single digit values correctly', () => {
      // 固定时间为2023-01-01 01:02:03
      const fixedDate = new Date('2023-01-01T01:02:03');
      vi.spyOn(Date, 'now').mockReturnValue(fixedDate.getTime());
      vi.useFakeTimers();
      vi.setSystemTime(fixedDate);

      const result = getNowDate();
      // 修复了bug，分钟现在正确显示
      expect(result).toBe('2023-01-01 01-02-03');

      vi.useRealTimers();
    });
  });
});
