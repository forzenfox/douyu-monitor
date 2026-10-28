import {
  createPacket,
  extractPackets,
  getDanmakuUrl,
  HEARTBEAT_PACKET_STR,
} from './danmakuProtocol.js';

const WS_OPEN = 1;

// 默认心跳间隔 20 秒：浏览器后台会把定时器降频到 1 分钟以上，
// 因此需要与页面生命周期恢复配合（ensureAlive）而不是单纯依赖定时器。
export const DEFAULT_HEARTBEAT_INTERVAL = 20000;

// 连续 3 个心跳周期未收到任何数据（含心跳回包）即判定连接已半开
export const DEFAULT_ACTIVITY_TIMEOUT = DEFAULT_HEARTBEAT_INTERVAL * 3;

export const DEFAULT_BASE_RECONNECT_INTERVAL = 1000;
export const DEFAULT_MAX_RECONNECT_INTERVAL = 60000;

/**
 * 斗鱼弹幕连接（不依赖 document，可运行在主线程或 Web Worker 中）
 * 职责：心跳保活、活性检测、断线无限退避重连、静默关闭
 */
export class DanmakuConnection {
  /**
   * @param {string} rid - 房间号
   * @param {Object} [options] - 配置项
   * @param {Function} [options.onMessage] - 业务消息回调
   * @param {Function} [options.onError] - 连接异常回调（手动关闭不会触发）
   * @param {Function} [options.onStatus] - 连接状态回调 (open: boolean)
   * @param {Function} [options.onActivity] - 收到任意数据的活性回调 (timestamp)
   * @param {Function} [options.urlBuilder] - 连接地址生成函数
   * @param {Object} [options.WebSocketImpl] - WebSocket 实现，便于测试注入
   * @param {number} [options.heartbeatInterval] - 心跳间隔（毫秒）
   * @param {number} [options.activityTimeout] - 活性超时（毫秒）
   * @param {number} [options.baseReconnectInterval] - 基础重连间隔（毫秒）
   * @param {number} [options.maxReconnectInterval] - 最大重连间隔（毫秒）
   * @param {Function} [options.random] - 随机数生成函数（用于重连抖动）
   */
  constructor(rid, options = {}) {
    this.rid = rid;
    this.WebSocketImpl =
      options.WebSocketImpl !== undefined
        ? options.WebSocketImpl
        : typeof WebSocket !== 'undefined'
          ? WebSocket
          : null;
    this.onMessage = options.onMessage || (() => {});
    this.onError = options.onError || (() => {});
    this.onStatus = options.onStatus || (() => {});
    this.onActivity = options.onActivity || (() => {});
    this.urlBuilder = options.urlBuilder || getDanmakuUrl;
    this.heartbeatInterval =
      options.heartbeatInterval !== undefined
        ? options.heartbeatInterval
        : DEFAULT_HEARTBEAT_INTERVAL;
    this.activityTimeout =
      options.activityTimeout !== undefined
        ? options.activityTimeout
        : DEFAULT_ACTIVITY_TIMEOUT;
    this.baseReconnectInterval =
      options.baseReconnectInterval !== undefined
        ? options.baseReconnectInterval
        : DEFAULT_BASE_RECONNECT_INTERVAL;
    this.maxReconnectInterval =
      options.maxReconnectInterval !== undefined
        ? options.maxReconnectInterval
        : DEFAULT_MAX_RECONNECT_INTERVAL;
    this.random = options.random || Math.random;

    this.ws = null;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.lastActivityAt = 0;
    this.manualClosed = false;
    this.started = false;
  }

  /**
   * 建立连接（重复调用会先静默关闭旧连接）
   */
  connect() {
    if (this.manualClosed) return;
    this.started = true;
    this._clearReconnectTimer();
    this._openSocket();
  }

  /**
   * 判断连接是否处于可用状态
   * @returns {boolean} 是否 OPEN
   */
  isOpen() {
    return Boolean(this.ws && this.ws.readyState === WS_OPEN);
  }

  /**
   * 页面恢复可见/从休眠唤醒时调用：
   * - 连接不可用：跳过退避等待，立即重连
   * - 连接假活（长时间无数据）：立即重连
   * - 连接正常：立即补发心跳
   */
  ensureAlive() {
    if (this.manualClosed) return;
    if (!this.started) {
      this.connect();
      return;
    }
    if (this.isOpen()) {
      const now = Date.now();
      if (now - this.lastActivityAt > this.activityTimeout) {
        // 页面恢复时不做退避等待，立即重建连接
        this._forceReconnect(true);
        return;
      }
      this._sendHeartbeat();
      return;
    }
    this._clearReconnectTimer();
    this._openSocket();
  }

  /**
   * 手动关闭连接：不触发错误回调，也不再重连
   */
  close() {
    this.manualClosed = true;
    this.started = false;
    this._clearReconnectTimer();
    this._stopHeartbeat();
    this._closeSocketQuietly();
  }

  _openSocket() {
    if (this.manualClosed) return;
    if (!this.WebSocketImpl) {
      this.onError();
      return;
    }

    this._closeSocketQuietly();

    let socket;
    try {
      socket = new this.WebSocketImpl(this.urlBuilder());
    } catch {
      this.onError();
      this._scheduleReconnect();
      return;
    }

    this.ws = socket;
    socket.binaryType = 'arraybuffer';
    socket.onopen = () => {
      if (this.ws !== socket) return;
      this.reconnectAttempts = 0;
      this.lastActivityAt = Date.now();
      this._sendLogin();
      this._startHeartbeat();
      this.onStatus(true);
    };
    socket.onmessage = event => {
      if (this.ws !== socket) return;
      this._handleRawData(event && event.data);
    };
    socket.onclose = () => this._handleDisconnect(socket);
    socket.onerror = () => this._handleDisconnect(socket);
  }

  _sendLogin() {
    this._send(createPacket(`type@=loginreq/roomid@=${this.rid}`));
    this._send(createPacket(`type@=joingroup/rid@=${this.rid}/gid@=-9999/`));
  }

  _send(packet) {
    if (!this.ws || this.ws.readyState !== WS_OPEN) return;
    try {
      this.ws.send(packet);
    } catch {
      // 发送失败交由活性检测兜底重连
    }
  }

  _sendHeartbeat() {
    this._send(createPacket(HEARTBEAT_PACKET_STR));
  }

  _handleRawData(data) {
    // 任意原始数据（包括心跳回包）都视为连接存活
    this.lastActivityAt = Date.now();
    this.onActivity(this.lastActivityAt);

    if (typeof data === 'string') {
      this._handleText(data);
      return;
    }
    if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
      this._handleText(new TextDecoder().decode(data));
      return;
    }
    if (
      typeof Blob !== 'undefined' &&
      data instanceof Blob &&
      typeof FileReader !== 'undefined'
    ) {
      const reader = new FileReader();
      reader.onload = () => this._handleText(String(reader.result || ''));
      reader.readAsText(data);
      return;
    }
    if (data && typeof data.text === 'function') {
      data.text().then(text => this._handleText(text));
    }
  }

  _handleText(text) {
    extractPackets(text).forEach(packet => this.onMessage(packet));
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    const tick = () => {
      this.heartbeatTimer = null;
      if (this.manualClosed || !this.isOpen()) return;

      // 长时间收不到任何数据，说明连接已半开，主动重连
      if (Date.now() - this.lastActivityAt > this.activityTimeout) {
        this._forceReconnect();
        return;
      }

      this._sendHeartbeat();
      this.heartbeatTimer = setTimeout(tick, this.heartbeatInterval);
    };
    this.heartbeatTimer = setTimeout(tick, this.heartbeatInterval);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  _handleDisconnect(socket) {
    if (this.ws !== socket) return;
    this._detachSocket(socket);
    this.ws = null;
    this._stopHeartbeat();
    if (this.manualClosed) return;

    this.onStatus(false);
    this.onError();
    this._scheduleReconnect();
  }

  /**
   * 主动判定连接失效并重连
   * @param {boolean} [immediate] - 为 true 时跳过退避等待立即重连
   */
  _forceReconnect(immediate = false) {
    if (this.manualClosed) return;
    this._closeSocketQuietly();
    this._stopHeartbeat();
    this.onStatus(false);
    this.onError();
    if (immediate) {
      this._clearReconnectTimer();
      this._openSocket();
      return;
    }
    this._scheduleReconnect();
  }

  _scheduleReconnect() {
    if (this.manualClosed) return;
    this._clearReconnectTimer();
    this.reconnectAttempts += 1;
    const delay = this._calcReconnectDelay();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.manualClosed) this._openSocket();
    }, delay);
  }

  _calcReconnectDelay() {
    const attempts = Math.max(1, this.reconnectAttempts);
    const base = Math.min(
      this.baseReconnectInterval * Math.pow(2, attempts - 1),
      this.maxReconnectInterval
    );
    // 抖动避免多个客户端在同一时刻重连
    return base + Math.floor(this.random() * 1000);
  }

  _clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  _detachSocket(socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
  }

  _closeSocketQuietly() {
    const socket = this.ws;
    if (!socket) return;
    this._detachSocket(socket);
    this.ws = null;
    try {
      socket.close();
    } catch {
      // 忽略关闭异常
    }
  }
}
