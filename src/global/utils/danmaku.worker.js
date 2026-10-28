import { DanmakuConnection } from './danmakuConnection.js';

// 弹幕连接托管在 Worker 中：Worker 定时器不受页面后台节流影响，
// 因此切换标签页/最小化时仍能按时发送心跳并自动重连。
let connection = null;

const post = message => {
  globalThis.postMessage(message);
};

const destroyConnection = () => {
  if (!connection) return;
  connection.close();
  connection = null;
};

globalThis.onmessage = event => {
  const data = (event && event.data) || {};

  switch (data.type) {
    case 'connect': {
      destroyConnection();
      connection = new DanmakuConnection(data.rid, {
        onMessage: message => post({ type: 'message', data: message }),
        onError: () => post({ type: 'error' }),
        onStatus: open => post({ type: 'status', open }),
        onActivity: at => post({ type: 'activity', at }),
      });
      connection.connect();
      break;
    }
    case 'ensureAlive': {
      if (connection) connection.ensureAlive();
      break;
    }
    case 'close': {
      destroyConnection();
      break;
    }
    default:
      break;
  }
};
