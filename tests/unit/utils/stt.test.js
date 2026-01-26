import { describe, it, expect } from 'vitest';
import { STT } from '../../../src/global/utils/stt.js';

describe('STT 类测试', () => {
  let stt;

  beforeEach(() => {
    stt = new STT();
  });

  describe('isObject 方法', () => {
    it('应该返回 true 当输入是对象时', () => {
      expect(stt.isObject({})).toBe(true);
      expect(stt.isObject({ key: 'value' })).toBe(true);
    });

    it('应该返回 false 当输入是 null 时', () => {
      expect(stt.isObject(null)).toBe(false);
    });

    it('应该返回 false 当输入是数组时', () => {
      expect(stt.isObject([])).toBe(false);
      expect(stt.isObject([1, 2, 3])).toBe(false);
    });

    it('应该返回 false 当输入是字符串时', () => {
      expect(stt.isObject('string')).toBe(false);
    });

    it('应该返回 false 当输入是数字时', () => {
      expect(stt.isObject(123)).toBe(false);
    });

    it('应该返回 false 当输入是布尔值时', () => {
      expect(stt.isObject(true)).toBe(false);
      expect(stt.isObject(false)).toBe(false);
    });

    it('应该返回 false 当输入是 undefined 时', () => {
      expect(stt.isObject(undefined)).toBe(false);
    });
  });

  describe('isString 方法', () => {
    it('应该返回 true 当输入是字符串时', () => {
      expect(stt.isString('')).toBe(true);
      expect(stt.isString('string')).toBe(true);
    });

    it('应该返回 false 当输入是数字时', () => {
      expect(stt.isString(123)).toBe(false);
    });

    it('应该返回 false 当输入是对象时', () => {
      expect(stt.isString({})).toBe(false);
    });

    it('应该返回 false 当输入是数组时', () => {
      expect(stt.isString([])).toBe(false);
    });

    it('应该返回 false 当输入是布尔值时', () => {
      expect(stt.isString(true)).toBe(false);
      expect(stt.isString(false)).toBe(false);
    });

    it('应该返回 false 当输入是 undefined 时', () => {
      expect(stt.isString(undefined)).toBe(false);
    });
  });

  describe('isNumber 方法', () => {
    it('应该返回 true 当输入是数字时', () => {
      expect(stt.isNumber(123)).toBe(true);
      expect(stt.isNumber(0)).toBe(true);
      expect(stt.isNumber(-123)).toBe(true);
      expect(stt.isNumber(123.45)).toBe(true);
    });

    it('应该返回 false 当输入是字符串时', () => {
      expect(stt.isNumber('123')).toBe(false);
      expect(stt.isNumber('string')).toBe(false);
    });

    it('应该返回 false 当输入是对象时', () => {
      expect(stt.isNumber({})).toBe(false);
    });

    it('应该返回 false 当输入是数组时', () => {
      expect(stt.isNumber([])).toBe(false);
    });

    it('应该返回 false 当输入是布尔值时', () => {
      expect(stt.isNumber(true)).toBe(false);
      expect(stt.isNumber(false)).toBe(false);
    });

    it('应该返回 false 当输入是 undefined 时', () => {
      expect(stt.isNumber(undefined)).toBe(false);
    });
  });

  describe('escape 方法', () => {
    it('应该正确转义 @ 字符', () => {
      expect(stt.escape('a@b')).toBe('a@Ab');
    });

    it('应该正确转义 / 字符', () => {
      expect(stt.escape('a/b')).toBe('a@Sb');
    });

    it('应该正确转义数字类型', () => {
      expect(stt.escape(123)).toBe('123');
    });

    it('应该正确转义布尔类型', () => {
      expect(stt.escape(true)).toBe('true');
      expect(stt.escape(false)).toBe('false');
    });

    it('应该正确转义 null', () => {
      expect(stt.escape(null)).toBe('');
    });
  });

  describe('unescape 方法', () => {
    it('应该正确反转义 @A 为 @', () => {
      expect(stt.unescape('a@Ab')).toBe('a@b');
    });

    it('应该正确反转义 @S 为 /', () => {
      expect(stt.unescape('a@Sb')).toBe('a/b');
    });

    it('应该返回空字符串当输入为 null 时', () => {
      expect(stt.unescape(null)).toBe('');
    });

    it('应该返回空字符串当输入为 undefined 时', () => {
      expect(stt.unescape(undefined)).toBe('');
    });

    it('应该正确处理空字符串', () => {
      expect(stt.unescape('')).toBe('');
    });

    it('应该正确处理没有转义字符的字符串', () => {
      expect(stt.unescape('normal string')).toBe('normal string');
    });
  });

  describe('serialize 方法', () => {
    it('应该正确序列化对象', () => {
      const input = { key1: 'value1', key2: 'value2' };
      const expected = 'key1@=value1/key2@=value2/';
      expect(stt.serialize(input)).toBe(expected);
    });

    it('应该正确序列化嵌套对象', () => {
      const input = { key1: { nestedKey: 'nestedValue' } };
      const expected = 'key1@=nestedKey@A=nestedValue@S/';
      expect(stt.serialize(input)).toBe(expected);
    });

    it('应该正确序列化数组', () => {
      const input = ['value1', 'value2'];
      const expected = 'value1/value2/';
      expect(stt.serialize(input)).toBe(expected);
    });

    it('应该正确序列化字符串', () => {
      expect(stt.serialize('string')).toBe('string');
    });

    it('应该正确序列化数字', () => {
      expect(stt.serialize(123)).toBe('123');
    });

    it('应该正确序列化包含特殊字符的字符串', () => {
      const input = { key: 'a@b/c' };
      const expected = 'key@=a@Ab@Sc/';
      expect(stt.serialize(input)).toBe(expected);
    });

    it('should explicitly test string and number type checks in serialize', () => {
      // 测试字符串类型检查
      const stringResult = stt.serialize('explicit string');
      expect(stringResult).toBe('explicit string');
      
      // 测试数字类型检查
      const numberResult = stt.serialize(789);
      expect(numberResult).toBe('789');
      
      // 确保isString和isNumber方法被正确调用
      const stringCheck = stt.isString('test');
      const numberCheck = stt.isNumber(123);
      expect(stringCheck).toBe(true);
      expect(numberCheck).toBe(true);
    });

    it('should handle boolean values in serialize', () => {
      // 测试布尔值的序列化
      const trueResult = stt.serialize(true);
      const falseResult = stt.serialize(false);
      expect(trueResult).toBe('true');
      expect(falseResult).toBe('false');
    });
  });

  describe('deserialize 方法', () => {
    it('应该返回 undefined 当输入为 null 时', () => {
      expect(stt.deserialize(null)).toBeUndefined();
    });

    it('应该返回 undefined 当输入为 undefined 时', () => {
      expect(stt.deserialize(undefined)).toBeUndefined();
    });

    it('应该正确反序列化简单对象', () => {
      const input = 'key1@=value1/key2@=value2/';
      const expected = { key1: 'value1', key2: 'value2' };
      expect(stt.deserialize(input)).toEqual(expected);
    });

    it('应该正确反序列化嵌套对象', () => {
      const input = 'key1@=nestedKey@A=nestedValue@S/';
      const expected = { key1: { nestedKey: 'nestedValue' } };
      expect(stt.deserialize(input)).toEqual(expected);
    });

    it('应该正确反序列化数组', () => {
      const input = 'value1//value2//';
      const expected = ['value1', 'value2'];
      expect(stt.deserialize(input)).toEqual(expected);
    });

    it('应该正确反序列化包含特殊字符的字符串', () => {
      const input = 'key@=a@Ab@Sc/';
      const expected = { key: 'a@b/c' };
      expect(stt.deserialize(input)).toEqual(expected);
    });

    it('应该正确反序列化只有值的字符串', () => {
      expect(stt.deserialize('string')).toBe('string');
    });

    it('应该正确处理包含 @A= 的字符串', () => {
      const input = 'key@A=value/';
      const expected = { key: 'value' };
      expect(stt.deserialize(input)).toEqual(expected);
    });
  });

  describe('完整序列化和反序列化流程', () => {
    it('应该能够序列化后再反序列化得到原对象', () => {
      const original = {
        key1: 'value1',
        key2: { nested: 'value2' },
        key4: 123,
        key5: 'a@b/c',
      };

      const serialized = stt.serialize(original);
      const deserialized = stt.deserialize(serialized);

      expect(deserialized.key1).toBe(original.key1);
      expect(deserialized.key2).toEqual(original.key2);
      expect(deserialized.key4).toBe('123'); // 序列化后数字会变成字符串
      expect(deserialized.key5).toBe(original.key5);
    });
  });
});
