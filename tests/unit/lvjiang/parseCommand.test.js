import { describe, it, expect } from 'vitest';
import {
  parseCommand,
  splitMemberAndValue,
} from '@/lvjiang/utils/parseCommand.js';

describe('splitMemberAndValue', () => {
  it('名单命中时优先按名单切分（纯数字昵称）', () => {
    expect(splitMemberAndValue('1451000', ['145'])).toEqual({
      member: '145',
      value: 1000,
    });
  });

  it('名单优先于通用解析，且最长昵称优先', () => {
    expect(splitMemberAndValue('1451000', ['14', '145'])).toEqual({
      member: '145',
      value: 1000,
    });
  });

  it('名单命中后允许紧跟小数', () => {
    expect(splitMemberAndValue('1451000.5', ['145'])).toEqual({
      member: '145',
      value: 1000.5,
    });
  });

  it('未命中名单时按通用规则切分末尾数字', () => {
    expect(splitMemberAndValue('光阴1000', [])).toEqual({
      member: '光阴',
      value: 1000,
    });
    expect(splitMemberAndValue('光阴12.5', [])).toEqual({
      member: '光阴',
      value: 12.5,
    });
  });

  it('团员名可含中间数字', () => {
    expect(splitMemberAndValue('a1b500', [])).toEqual({
      member: 'a1b',
      value: 500,
    });
  });

  it('无法得到有效团员名时返回 null', () => {
    expect(splitMemberAndValue('1000', [])).toBeNull();
    expect(splitMemberAndValue('', [])).toBeNull();
    expect(splitMemberAndValue('1451000', [])).toBeNull();
  });
});

describe('parseCommand', () => {
  it('解析给分指令', () => {
    expect(parseCommand('#给光阴1000', [])).toEqual({
      type: 'give',
      member: '光阴',
      value: 1000,
    });
  });

  it('解析炸分指令', () => {
    expect(parseCommand('#炸光阴1000', [])).toEqual({
      type: 'bomb',
      member: '光阴',
      value: 1000,
    });
  });

  it('名单消歧：纯数字昵称', () => {
    expect(parseCommand('#给1451000', ['145'])).toEqual({
      type: 'give',
      member: '145',
      value: 1000,
    });
  });

  it('容忍团员名与数值之间的空格及首尾空白', () => {
    expect(parseCommand('  #给 光阴 1000  ', [])).toEqual({
      type: 'give',
      member: '光阴',
      value: 1000,
    });
  });

  it('支持小数温度值', () => {
    expect(parseCommand('#炸白晶晶1.5', [])).toEqual({
      type: 'bomb',
      member: '白晶晶',
      value: 1.5,
    });
  });

  it('解析失败（无有效团员名）返回 null', () => {
    expect(parseCommand('#给1000', [])).toBeNull();
    expect(parseCommand('#给', [])).toBeNull();
    expect(parseCommand('#给光阴', [])).toBeNull();
  });

  it('非指令弹幕返回 null', () => {
    expect(parseCommand('普通弹幕', [])).toBeNull();
    expect(parseCommand('我想给光阴1000', [])).toBeNull();
    expect(parseCommand('', [])).toBeNull();
    expect(parseCommand(undefined, [])).toBeNull();
  });
});
