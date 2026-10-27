import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseUrl } from '@/router.js';

const ORIGIN = 'https://dm.forzenfox.com';

/** 替换 window.location，便于断言跳转目标 */
function mockLocation(href = `${ORIGIN}/`) {
  const url = new URL(href);
  delete window.location;
  window.location = {
    href,
    origin: url.origin,
    pathname: url.pathname,
    search: url.search,
  };
  return window.location;
}

const $ = selector => document.querySelector(selector);

describe('parseUrl 首页入口选择', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('根路径访问时弹出入口选择弹窗', () => {
    mockLocation(`${ORIGIN}/`);

    parseUrl();

    expect($('.entry-modal')).not.toBeNull();
    expect($('.entry-option--lvjiang')).not.toBeNull();
    expect($('.entry-option--monitor')).not.toBeNull();
  });

  it('选择团播看板后跳转到 /lvjiangqingchuntuan', async () => {
    const loc = mockLocation(`${ORIGIN}/`);

    const pending = parseUrl();
    $('.entry-option--lvjiang').click();

    await expect(pending).resolves.toEqual({ redirect: true });
    expect(loc.href).toBe(`${ORIGIN}/lvjiangqingchuntuan`);
  });

  it('选择通用监控并输入房间号后跳转到对应房间', async () => {
    const loc = mockLocation(`${ORIGIN}/`);

    const pending = parseUrl();
    $('.entry-option--monitor').click();
    $('.entry-input').value = '123';
    $('.entry-confirm').click();

    await expect(pending).resolves.toEqual({ redirect: true });
    expect(loc.href).toBe(`${ORIGIN}/123`);
  });

  it('直接访问 /lvjiangqingchuntuan 不再弹窗，房间号默认 317422', async () => {
    mockLocation(`${ORIGIN}/lvjiangqingchuntuan`);

    const info = await parseUrl();

    expect(info).toEqual({ type: 'lvjiang', rid: '317422' });
    expect($('.entry-modal')).toBeNull();
  });

  it('访问 /lvjiangqingchuntuan?rid=999 时以查询参数为准', async () => {
    mockLocation(`${ORIGIN}/lvjiangqingchuntuan?rid=999`);

    const info = await parseUrl();

    expect(info.type).toBe('lvjiang');
    expect(info.rid).toBe('999');
    expect($('.entry-modal')).toBeNull();
  });

  it('访问普通房间路径时行为不变（不弹入口选择）', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: { room_id: '456' } }),
        })
      )
    );
    mockLocation(`${ORIGIN}/123`);

    const info = await parseUrl();

    expect(info.rid).toBe('456');
    expect($('.entry-modal')).toBeNull();
  });
});
