import { describe, it, expect } from 'vitest';
import { parseAssistantReply } from '@/lvjiang/utils/parseAssistantReply.js';

describe('parseAssistantReply', () => {
  it('解析给分确认样例一', () => {
    expect(
      parseAssistantReply('@我松洞了，转给豆包2000温度值，剩余1533.4温度值', [])
    ).toEqual({
      boss: '我松洞了',
      type: 'give',
      member: '豆包',
      value: 2000,
      remaining: 1533.4,
    });
  });

  it('解析给分确认样例二', () => {
    expect(
      parseAssistantReply('@小牛啃草，转给醋醋100温度值，剩余2.1温度值', [])
    ).toEqual({
      boss: '小牛啃草',
      type: 'give',
      member: '醋醋',
      value: 100,
      remaining: 2.1,
    });
  });

  it('解析炸分确认样例', () => {
    expect(
      parseAssistantReply('@新驴酱丶张顺飞，炸白晶晶1温度值，剩余0.5温度值', [])
    ).toEqual({
      boss: '新驴酱丶张顺飞',
      type: 'bomb',
      member: '白晶晶',
      value: 1,
      remaining: 0.5,
    });
  });

  it('名单消歧：转给1451000温度值', () => {
    expect(
      parseAssistantReply('@老板，转给1451000温度值，剩余0温度值', ['145'])
    ).toEqual({
      boss: '老板',
      type: 'give',
      member: '145',
      value: 1000,
      remaining: 0,
    });
  });

  it('兼容中英文冒号/逗号', () => {
    expect(
      parseAssistantReply('@老板: 转给豆包100温度值，剩余1温度值', [])
    ).toEqual({
      boss: '老板',
      type: 'give',
      member: '豆包',
      value: 100,
      remaining: 1,
    });
  });

  it('兼容“回复@某某：”前缀', () => {
    expect(
      parseAssistantReply(
        '回复@我松洞了：转给豆包2000温度值，剩余1533.4温度值',
        []
      )
    ).toEqual({
      boss: '我松洞了',
      type: 'give',
      member: '豆包',
      value: 2000,
      remaining: 1533.4,
    });
  });

  it('无 @ 时老板昵称为空，仍可解析团员与数值', () => {
    expect(
      parseAssistantReply('转给豆包2000温度值，剩余1533.4温度值', [])
    ).toEqual({
      boss: '',
      type: 'give',
      member: '豆包',
      value: 2000,
      remaining: 1533.4,
    });
  });

  it('团员名/数值解析失败时返回 null 值，但仍保留老板信息', () => {
    expect(parseAssistantReply('@老板，转给温度值，剩余1温度值', [])).toEqual({
      boss: '老板',
      type: 'give',
      member: null,
      value: null,
      remaining: 1,
    });
  });

  it('缺少“温度值”或“剩余”时返回 null', () => {
    expect(parseAssistantReply('@老板，转给豆包2000温度值', [])).toBeNull();
    expect(parseAssistantReply('@老板，转给豆包2000', [])).toBeNull();
    expect(parseAssistantReply('别的话术，剩余1温度值', [])).toBeNull();
    expect(parseAssistantReply('', [])).toBeNull();
  });

  it('未知模板（无转给/炸关键词）返回 null', () => {
    expect(
      parseAssistantReply('@老板，给豆包2000温度值，剩余1温度值', [])
    ).toBe(null);
  });
});
