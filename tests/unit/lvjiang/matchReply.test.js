import { describe, it, expect } from 'vitest';
import { matchReply } from '@/lvjiang/utils/matchReply.js';

const item = (id, overrides = {}) => ({
  id,
  boss: '老板A',
  member: '光阴',
  value: 100,
  status: 'pending',
  timestamp: 1000,
  ...overrides,
});

describe('matchReply', () => {
  it('优先级1：老板+团员+数值全一致', () => {
    const list = [
      item('a', { value: 50 }),
      item('b', { value: 100 }),
      item('c', { member: '醋醋', value: 100 }),
    ];
    const reply = { boss: '老板A', member: '光阴', value: 100 };
    expect(matchReply(reply, list).id).toBe('b');
  });

  it('优先级1：取最近（最新）一条', () => {
    const list = [
      item('a', { timestamp: 1000 }),
      item('b', { timestamp: 2000 }),
      item('c', { timestamp: 3000 }),
    ];
    const reply = { boss: '老板A', member: '光阴', value: 100 };
    expect(matchReply(reply, list).id).toBe('c');
  });

  it('优先级2：数值不一致时按老板+团员匹配', () => {
    const list = [item('a', { value: 50 }), item('b', { value: 999 })];
    const reply = { boss: '老板A', member: '光阴', value: 100 };
    expect(matchReply(reply, list).id).toBe('b');
  });

  it('优先级3：团员名解析失败时按老板匹配', () => {
    const list = [item('a'), item('b', { member: '醋醋' })];
    const reply = { boss: '老板A', member: null, value: null };
    expect(matchReply(reply, list).id).toBe('b');
  });

  it('优先级4：无老板昵称时按团员+数值匹配', () => {
    const list = [item('a', { boss: '老板B', value: 100 })];
    const reply = { boss: '', member: '光阴', value: 100 };
    expect(matchReply(reply, list).id).toBe('a');
  });

  it('优先级5：无法命中时返回 null', () => {
    const list = [item('a')];
    expect(
      matchReply({ boss: '老板X', member: '光阴', value: 100 }, list)
    ).toBeNull();
    expect(
      matchReply({ boss: '', member: '不存在的团员', value: 1 }, list)
    ).toBeNull();
  });

  it('不参与匹配已非 pending 的条目', () => {
    const list = [
      item('a', { status: 'valid' }),
      item('b', { status: 'unconfirmed' }),
    ];
    const reply = { boss: '老板A', member: '光阴', value: 100 };
    expect(matchReply(reply, list)).toBeNull();
  });

  it('空列表或无回复时返回 null', () => {
    expect(
      matchReply({ boss: '老板A', member: '光阴', value: 100 }, [])
    ).toBeNull();
    expect(matchReply(null, [item('a')])).toBeNull();
  });
});
