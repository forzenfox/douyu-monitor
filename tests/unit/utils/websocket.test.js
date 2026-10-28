import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Ex_WebSocket_UnLogin } from '@/global/utils/websocket.js';
import { createPacket } from '@/global/utils/danmakuProtocol.js';

// 模拟 Worker，记录主线程与 Worker 之间的消息
class FakeWorker {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.posted = [];
    this.terminated = false;
    this.onmessage = null;
    this.onerror = null;
    FakeWorker.instances.push(this);
  }

  postMessage(message) {
    this.posted.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  // 测试辅助：模拟 Worker 向主线程回传消息
  emit(data) {
    if (this.onmessage) this.onmessage({ data });
  }
}

// 模拟 WebSocket，用于主线程回退路径
class FakeWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    FakeWebSocket.instances.push(this);
  }

  send(data) {
    this.sent.push(data);
  }

  close() {
    if (this.readyState === FakeWebSocket.CLOSED) return;
    this.readyState = FakeWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    if (this.onopen) this.onopen();
  }

  emitMessage(data) {
    if (this.onmessage) this.onmessage({ data });
  }

  emitClose() {
    this.readyState = FakeWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
}

FakeWorker.instances = [];
FakeWebSocket.instances = [];
FakeWebSocket.OPEN = 1;
FakeWebSocket.CLOSED = 3;

const setHidden = hidden => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    value: hidden,
  });
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: hidden ? 'hidden' : 'visible',
  });
};

describe('Ex_WebSocket_UnLogin 门面', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    FakeWebSocket.instances = [];
    setHidden(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('Worker 传输', () => {
    beforeEach(() => {
      vi.stubGlobal('Worker', FakeWorker);
    });

    it('优先使用 Worker 并透传消息、状态与活性', () => {
      const onMessage = vi.fn();
      const onError = vi.fn();
      const onStatus = vi.fn();
      const onActivity = vi.fn();

      new Ex_WebSocket_UnLogin('123', onMessage, onError, {
        onStatus,
        onActivity,
      });

      const worker = FakeWorker.instances[0];
      expect(FakeWorker.instances).toHaveLength(1);
      expect(worker.posted).toEqual([{ type: 'connect', rid: '123' }]);

      worker.emit({ type: 'status', open: true });
      expect(onStatus).toHaveBeenCalledWith(true);

      worker.emit({ type: 'message', data: 'type@=chatmsg/txt@=hi/' });
      expect(onMessage).toHaveBeenCalledWith('type@=chatmsg/txt@=hi/');

      worker.emit({ type: 'activity', at: 1234 });
      expect(onActivity).toHaveBeenCalledWith(1234);

      worker.emit({ type: 'error' });
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('页面重新可见或恢复时向 Worker 发送 ensureAlive', () => {
      new Ex_WebSocket_UnLogin('123', vi.fn(), vi.fn());
      const worker = FakeWorker.instances[0];

      setHidden(true);
      document.dispatchEvent(new Event('visibilitychange'));
      expect(worker.posted).toHaveLength(1);

      setHidden(false);
      document.dispatchEvent(new Event('visibilitychange'));
      expect(worker.posted.at(-1)).toEqual({ type: 'ensureAlive' });

      document.dispatchEvent(new Event('resume'));
      expect(worker.posted.at(-1)).toEqual({ type: 'ensureAlive' });

      document.dispatchEvent(new Event('pageshow'));
      expect(worker.posted.at(-1)).toEqual({ type: 'ensureAlive' });
    });

    it('close 后移除页面监听、终止 Worker 且不再触发回调', () => {
      const onMessage = vi.fn();
      const onError = vi.fn();

      const first = new Ex_WebSocket_UnLogin('1', onMessage, onError);
      const workerA = FakeWorker.instances[0];

      first.close();
      expect(workerA.posted.at(-1)).toEqual({ type: 'close' });
      expect(workerA.terminated).toBe(true);

      const postedLength = workerA.posted.length;
      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('resume'));
      document.dispatchEvent(new Event('pageshow'));
      expect(workerA.posted).toHaveLength(postedLength);

      expect(onMessage).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      // 新实例仍可正常接收页面事件，旧实例不会重复响应
      new Ex_WebSocket_UnLogin('2', vi.fn(), vi.fn());
      const workerB = FakeWorker.instances[1];
      document.dispatchEvent(new Event('visibilitychange'));

      expect(workerB.posted.at(-1)).toEqual({ type: 'ensureAlive' });
      expect(workerA.posted).toHaveLength(postedLength);
    });
  });

  describe('主线程回退传输', () => {
    beforeEach(() => {
      vi.stubGlobal('WebSocket', FakeWebSocket);
    });

    it('Worker 不可用时回退到主线程连接并透传状态', () => {
      const onMessage = vi.fn();
      const onError = vi.fn();
      const onStatus = vi.fn();

      new Ex_WebSocket_UnLogin('321', onMessage, onError, { onStatus });

      expect(FakeWorker.instances).toHaveLength(0);
      expect(FakeWebSocket.instances).toHaveLength(1);

      const socket = FakeWebSocket.instances[0];
      expect(socket.url).toMatch(/^wss:\/\/danmuproxy\.douyu\.com:850[2-5]$/);

      socket.open();
      expect(onStatus).toHaveBeenCalledWith(true);
      expect(socket.sent[0]).toEqual(
        createPacket('type@=loginreq/roomid@=321')
      );

      socket.emitMessage('type@=chatmsg/txt@=hi/\0');
      expect(onMessage).toHaveBeenCalledWith('type@=chatmsg/txt@=hi/');
    });

    it('主线程回退路径断线后自动重连', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      new Ex_WebSocket_UnLogin('321', vi.fn(), vi.fn(), {
        onStatus: vi.fn(),
      });
      FakeWebSocket.instances[0].open();
      FakeWebSocket.instances[0].emitClose();

      vi.advanceTimersByTime(1000);
      expect(FakeWebSocket.instances).toHaveLength(2);
    });

    it('主线程回退路径 close 后静默且不再重连', () => {
      const onError = vi.fn();
      const client = new Ex_WebSocket_UnLogin('321', vi.fn(), onError);

      FakeWebSocket.instances[0].open();
      client.close();

      vi.advanceTimersByTime(5000);
      expect(FakeWebSocket.instances).toHaveLength(1);
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
