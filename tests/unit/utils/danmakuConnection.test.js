import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DanmakuConnection } from '@/global/utils/danmakuConnection.js';
import {
  createPacket,
  HEARTBEAT_PACKET_STR,
} from '@/global/utils/danmakuProtocol.js';

// 模拟 WebSocket，便于手动控制连接状态与事件
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    MockWebSocket.instances.push(this);
  }

  send(data) {
    this.sent.push(data);
  }

  close() {
    if (this.readyState === MockWebSocket.CLOSED) return;
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }

  // 测试辅助方法
  open() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) this.onopen();
  }

  emitMessage(data) {
    if (this.onmessage) this.onmessage({ data });
  }

  emitClose() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
}

MockWebSocket.instances = [];
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSED = 3;

const createConnection = (overrides = {}) => {
  const events = { messages: [], errors: 0, statuses: [], activities: [] };
  const conn = new DanmakuConnection('123456', {
    WebSocketImpl: MockWebSocket,
    heartbeatInterval: 100,
    activityTimeout: 300,
    baseReconnectInterval: 100,
    maxReconnectInterval: 800,
    random: () => 0,
    urlBuilder: () => 'wss://danmuproxy.douyu.com:8502',
    onMessage: msg => events.messages.push(msg),
    onError: () => {
      events.errors += 1;
    },
    onStatus: open => events.statuses.push(open),
    onActivity: at => events.activities.push(at),
    ...overrides,
  });
  return { conn, events };
};

const openConnection = (overrides = {}) => {
  const { conn, events } = createConnection(overrides);
  conn.connect();
  const socket = MockWebSocket.instances.at(-1);
  socket.open();
  return { conn, events, socket };
};

describe('DanmakuConnection', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('连接成功后发送登录与加组包', () => {
    const { socket } = openConnection();

    expect(socket.sent).toHaveLength(2);
    expect(socket.sent[0]).toEqual(
      createPacket('type@=loginreq/roomid@=123456')
    );
    expect(socket.sent[1]).toEqual(
      createPacket('type@=joingroup/rid@=123456/gid@=-9999/')
    );
  });

  it('建立连接后按固定间隔发送心跳包', () => {
    const { socket } = openConnection();

    vi.advanceTimersByTime(100);
    expect(socket.sent).toHaveLength(3);
    expect(socket.sent[2]).toEqual(createPacket(HEARTBEAT_PACKET_STR));

    vi.advanceTimersByTime(100);
    expect(socket.sent).toHaveLength(4);
  });

  it('业务消息按包回调，心跳回包仅更新活性', () => {
    const { events, socket } = openConnection();

    socket.emitMessage('type@=chatmsg/nn@=a/txt@=hi/\0type@=mrkl/\0');

    expect(events.messages).toEqual(['type@=chatmsg/nn@=a/txt@=hi/']);
    expect(events.activities).toHaveLength(1);
  });

  it('心跳回包可延长活性，避免冷清房间误判超时', () => {
    const { events, socket } = openConnection();

    vi.advanceTimersByTime(150);
    socket.emitMessage('type@=mrkl/\0');

    // 再推进 250ms（t=400），若未刷新活性会触发重连
    vi.advanceTimersByTime(250);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(events.errors).toBe(0);
    expect(events.statuses).toEqual([true]);
  });

  it('超过活性超时时间后强制重连', () => {
    const { events, socket } = openConnection();
    expect(socket).toBe(MockWebSocket.instances[0]);

    vi.advanceTimersByTime(400);

    expect(events.statuses).toEqual([true, false]);
    expect(events.errors).toBe(1);
    expect(MockWebSocket.instances).toHaveLength(1);

    // 退避 100ms 后重新建立连接
    vi.advanceTimersByTime(100);
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('断线采用指数退避重连', () => {
    openConnection();
    const delays = [100, 200, 400, 800, 800];

    let expectedCount = MockWebSocket.instances.length;
    for (const delay of delays) {
      MockWebSocket.instances.at(-1).emitClose();

      vi.advanceTimersByTime(delay - 1);
      expect(MockWebSocket.instances).toHaveLength(expectedCount);

      vi.advanceTimersByTime(1);
      expectedCount += 1;
      expect(MockWebSocket.instances).toHaveLength(expectedCount);
    }
  });

  it('重连次数不设上限', () => {
    const { events, socket } = openConnection();
    expect(socket).toBe(MockWebSocket.instances[0]);

    for (let i = 0; i < 60; i++) {
      MockWebSocket.instances.at(-1).emitClose();
      vi.advanceTimersByTime(800);
    }

    expect(MockWebSocket.instances).toHaveLength(61);
    expect(events.errors).toBe(60);
    expect(events.statuses).toEqual([true, ...Array(60).fill(false)]);
  });

  it('close 静默关闭，不触发错误回调也不再重连', () => {
    const { conn, events, socket } = openConnection();

    conn.close();
    expect(conn.isOpen()).toBe(false);
    expect(events.errors).toBe(0);
    expect(events.statuses).toEqual([true]);

    vi.advanceTimersByTime(5000);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(socket.sent).toHaveLength(2);
  });

  it('ensureAlive 在连接未就绪时立即重连', () => {
    const { conn, socket } = openConnection();
    // 模拟页面冻结后 socket 已失效但未收到 close 事件
    socket.readyState = MockWebSocket.CLOSED;

    conn.ensureAlive();

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('ensureAlive 在等待退避重连时立即重连', () => {
    const { conn, socket } = openConnection();
    socket.emitClose();
    expect(MockWebSocket.instances).toHaveLength(1);

    conn.ensureAlive();

    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it('ensureAlive 在连接正常时立即补发心跳', () => {
    const { conn, socket } = openConnection();
    const sentBefore = socket.sent.length;

    conn.ensureAlive();

    expect(socket.sent).toHaveLength(sentBefore + 1);
    expect(socket.sent.at(-1)).toEqual(createPacket(HEARTBEAT_PACKET_STR));
  });

  it('ensureAlive 在页面休眠后连接假活时立即重连', () => {
    const { conn } = openConnection();

    // 页面休眠：时钟前进但定时器未执行
    vi.setSystemTime(Date.now() + 5000);
    conn.ensureAlive();

    expect(MockWebSocket.instances).toHaveLength(2);
  });
});
