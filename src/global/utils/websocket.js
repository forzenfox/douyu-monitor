import { DanmakuConnection } from './danmakuConnection.js';

/*
   DouyuEx WebSocket UnLogin
    By: 小淳

   对外保持原有 API（new Ex_WebSocket_UnLogin(rid, callback, callback_error)），
   内部传输层优先使用 Web Worker 承载连接：Worker 定时器不受页面后台节流影响，
   切换标签页/最小化/锁屏恢复后仍能按时心跳并自动重连。
   extra 可选：{ onStatus(open), onActivity(timestamp) }
*/
class Ex_WebSocket_UnLogin {
  // 调用方法：
  // 连接：let a = new Ex_WebSocket_UnLogin("房间号", 消息回调函数, 错误回调函数);
  // 关闭连接: a.close(); a = null; 记得null掉变量再重新连接
  // 消息回调函数建议用箭头函数，示例：(msg) => {// TODO}
  constructor(rid, callback, callback_error, extra = {}) {
    this.roomid = rid;
    this.callback = callback || (() => {});
    this.callback_error = callback_error || (() => {});
    this.onStatus = extra.onStatus || (() => {});
    this.onActivity = extra.onActivity || (() => {});

    this.closed = false;
    this.worker = null;
    this.connection = null;
    this._lifecycleListeners = [];

    this._startTransport();
    this._bindLifecycle();

    if (this.worker) {
      this.worker.postMessage({ type: 'connect', rid: this.roomid });
    } else if (this.connection) {
      this.connection.connect();
    }
  }

  /**
   * 优先使用 Worker 传输，环境不支持或构造失败时回退主线程连接
   */
  _startTransport() {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(
          new URL('./danmaku.worker.js', import.meta.url),
          { type: 'module' }
        );
        this.worker.onmessage = event => this._handleWorkerMessage(event);
        this.worker.onerror = () => {
          if (!this.closed) this.callback_error();
        };
        return;
      } catch {
        this.worker = null;
      }
    }

    this.connection = new DanmakuConnection(this.roomid, {
      onMessage: msg => {
        if (!this.closed) this.callback(msg);
      },
      onError: () => {
        if (!this.closed) this.callback_error();
      },
      onStatus: open => {
        if (!this.closed) this.onStatus(open);
      },
      onActivity: at => {
        if (!this.closed) this.onActivity(at);
      },
    });
  }

  _handleWorkerMessage(event) {
    const data = event && event.data;
    if (!data || this.closed) return;

    switch (data.type) {
      case 'message':
        this.callback(data.data);
        break;
      case 'status':
        this.onStatus(Boolean(data.open));
        break;
      case 'activity':
        this.onActivity(data.at);
        break;
      case 'error':
        this.callback_error();
        break;
      default:
        break;
    }
  }

  /**
   * 监听页面生命周期：恢复可见/从休眠唤醒时立即校准连接
   */
  _bindLifecycle() {
    if (typeof document === 'undefined') return;

    const ensureAlive = () => {
      if (!this.closed) this._ensureAlive();
    };
    const onVisibilityChange = () => {
      // 进入后台时无需处理，回到前台立即校准
      if (document.hidden) return;
      ensureAlive();
    };

    this._lifecycleListeners = [
      ['visibilitychange', onVisibilityChange],
      ['freeze', ensureAlive],
      ['resume', ensureAlive],
      ['pageshow', ensureAlive],
    ];
    this._lifecycleListeners.forEach(([name, handler]) => {
      document.addEventListener(name, handler);
    });
  }

  _ensureAlive() {
    if (this.worker) {
      this.worker.postMessage({ type: 'ensureAlive' });
    } else if (this.connection) {
      this.connection.ensureAlive();
    }
  }

  /**
   * 静默关闭：移除页面监听、终止 Worker/连接，不再触发任何回调
   */
  close() {
    if (this.closed) return;
    this.closed = true;

    if (typeof document !== 'undefined') {
      this._lifecycleListeners.forEach(([name, handler]) => {
        document.removeEventListener(name, handler);
      });
    }
    this._lifecycleListeners = [];

    if (this.worker) {
      const worker = this.worker;
      this.worker = null;
      worker.onmessage = null;
      worker.onerror = null;
      try {
        worker.postMessage({ type: 'close' });
      } catch {
        // 忽略 Worker 已不可用的异常
      }
      worker.terminate();
    }

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }
}

export { Ex_WebSocket_UnLogin };
