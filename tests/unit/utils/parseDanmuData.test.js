import { describe, it, expect } from 'vitest';
import { parseDanmuData } from '../../scripts/test-danmu-parse';
import { resolve } from 'path';

describe('Danmu Data Parsing', () => {
  // 测试数据文件路径
  const testDataPath = resolve(
    __dirname,
    '../../data/danmuTestDataSimplified.txt'
  );

  it('should parse danmu data file correctly', () => {
    const result = parseDanmuData(testDataPath);

    // 验证解析结果
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);

    // 验证每条数据的格式
    result.forEach(item => {
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('rid');
      expect(item).toHaveProperty('ct');
      expect(item).toHaveProperty('uid');
      expect(item).toHaveProperty('nn');
      expect(item).toHaveProperty('txt');
      expect(item).toHaveProperty('cid');
      expect(item).toHaveProperty('ic');
      expect(item).toHaveProperty('level');
      expect(item).toHaveProperty('col');
      expect(item).toHaveProperty('cst');
      expect(item).toHaveProperty('bnn');
      expect(item).toHaveProperty('bl');
      expect(item).toHaveProperty('brid');
      expect(item).toHaveProperty('hc');
      expect(item).toHaveProperty('styleType');
      expect(item).toHaveProperty('isSpecial');
      expect(item).toHaveProperty('createdAt');
      expect(item).toHaveProperty('key');

      // 验证数值类型字段
      expect(typeof item.ct).toBe('number');
      expect(typeof item.level).toBe('number');
      expect(typeof item.col).toBe('number');
      expect(typeof item.cst).toBe('number');
      expect(typeof item.bl).toBe('number');

      // 验证布尔类型字段
      expect(typeof item.isSpecial).toBe('boolean');
    });
  });

  it('should parse all 3 danmu styles from test file', () => {
    const result = parseDanmuData(testDataPath);

    // 验证解析结果包含3条数据
    expect(result.length).toBe(3);

    // 验证包含所有样式类型
    const styles = result.map(item => item.ct);
    expect(styles).toContain(1); // 普通样式
    expect(styles).toContain(2); // 特殊样式1
    expect(styles).toContain(14); // 特殊样式2
  });

  it('should correctly identify special danmu styles', () => {
    const result = parseDanmuData(testDataPath);

    // 验证特殊样式识别正确
    result.forEach(item => {
      if ([2, 14].includes(item.ct)) {
        expect(item.isSpecial).toBe(true);
      } else {
        expect(item.isSpecial).toBe(false);
      }
    });
  });

  it('should handle invalid data gracefully', () => {
    // 测试不存在的文件
    expect(parseDanmuData('non-existent-file.txt')).toEqual([]);

    // 创建一个包含无效数据的临时文件
    const tempFilePath = resolve(__dirname, 'temp-danmu-test.txt');
    require('fs').writeFileSync(tempFilePath, 'invalid danmu data');

    const result = parseDanmuData(tempFilePath);
    expect(result.length).toBe(0);

    // 清理临时文件
    require('fs').unlinkSync(tempFilePath);
  });

  it('should handle empty file correctly', () => {
    // 创建一个空文件
    const tempFilePath = resolve(__dirname, 'temp-empty-danmu.txt');
    require('fs').writeFileSync(tempFilePath, '');

    const result = parseDanmuData(tempFilePath);
    expect(result).toEqual([]);

    // 清理临时文件
    require('fs').unlinkSync(tempFilePath);
  });

  it('should parse specific danmu styles correctly', () => {
    const result = parseDanmuData(testDataPath);

    // 测试样式1：普通弹幕
    const normalDanmu = result.find(item => item.ct === 1);
    expect(normalDanmu).toBeDefined();
    expect(normalDanmu.type).toBe('chatmsg');
    expect(normalDanmu.rid).toBe('317422');
    expect(normalDanmu.nn).toBe('虚伪小丑肥');
    expect(normalDanmu.txt).toBe('第一天都是雪，不滑的');
    expect(normalDanmu.level).toBe(10);
    expect(normalDanmu.isSpecial).toBe(false);

    // 测试样式2：特殊弹幕
    const specialDanmu1 = result.find(item => item.ct === 2);
    expect(specialDanmu1).toBeDefined();
    expect(specialDanmu1.type).toBe('chatmsg');
    expect(specialDanmu1.rid).toBe('317422');
    expect(specialDanmu1.nn).toBe('跑腿的小土豆');
    expect(specialDanmu1.txt).toBe('？');
    expect(specialDanmu1.level).toBe(35);
    expect(specialDanmu1.isSpecial).toBe(true);

    // 测试样式14：另一种特殊弹幕
    const specialDanmu2 = result.find(item => item.ct === 14);
    expect(specialDanmu2).toBeDefined();
    expect(specialDanmu2.type).toBe('chatmsg');
    expect(specialDanmu2.rid).toBe('317422');
    expect(specialDanmu2.nn).toBe('软木塞鴿');
    expect(specialDanmu2.txt).toBe('主播你会秒人吗');
    expect(specialDanmu2.level).toBe(24);
    expect(specialDanmu2.isSpecial).toBe(true);
  });

  it('should assign default values for missing fields', () => {
    // 创建一个模拟的不完整数据行
    const mockData =
      'type@=chatmsg/rid@=123456/uid@=7890/nn@=测试用户/txt@=测试内容@S/cid@=abc123/ic@=avatar@Sdefault@S01/';

    // 写入临时文件
    const tempFilePath = resolve(__dirname, 'temp-incomplete-danmu.txt');
    require('fs').writeFileSync(tempFilePath, mockData);

    const result = parseDanmuData(tempFilePath);

    // 验证解析结果
    expect(result.length).toBe(1);
    expect(result[0].ct).toBe(1); // 默认样式
    expect(result[0].level).toBe(1); // 默认等级
    expect(result[0].col).toBe(0); // 默认颜色
    expect(result[0].bl).toBe(0); // 默认粉丝等级
    expect(result[0].bnn).toBe(''); // 默认所属公会
    expect(result[0].isSpecial).toBe(false); // 默认非特殊样式

    // 清理临时文件
    require('fs').unlinkSync(tempFilePath);
  });

  it('should generate unique keys for danmu messages', () => {
    const result = parseDanmuData(testDataPath);

    // 提取所有key
    const keys = result.map(item => item.key);

    // 验证key的唯一性
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);

    // 验证key的格式
    keys.forEach(key => {
      expect(key).toBeDefined();
      expect(key).not.toBe('');
    });
  });

  it('should parse timestamps correctly', () => {
    const result = parseDanmuData(testDataPath);

    result.forEach(item => {
      // 验证时间戳是有效数字
      expect(typeof item.createdAt).toBe('number');
      expect(item.createdAt).toBeGreaterThan(0);

      // 验证时间戳可以转换为有效日期
      const date = new Date(item.createdAt);
      expect(date.getTime()).toBeGreaterThan(0);
    });
  });
});
