import { ref } from 'vue';
import { Ex_WebSocket_UnLogin } from '@/global/utils/websocket.js';
import { STT } from '@/global/utils/stt.js';
import { parseCommand } from '../utils/parseCommand.js';
import { parseAssistantReply } from '../utils/parseAssistantReply.js';
import { matchReply } from '../utils/matchReply.js';

// WebSocket 重连相关配置
const MAX_RECONNECT_ATTEMPTS = 50; // 最大重连次数
const BASE_RECONNECT_INTERVAL = 1000; // 基础重连间隔（毫秒）
const MAX_RECONNECT_INTERVAL = 60000; // 最大重连间隔（毫秒）
const HEARTBEAT_INTERVAL = 30000; // 心跳间隔（毫秒）
const TIMEOUT_SCAN_INTERVAL = 1000; // 超时扫描间隔（毫秒）

/**
 * 驴酱青春团团播看板弹幕连接
 * 复用 Ex_WebSocket_UnLogin + STT，处理 chatmsg：
 *  - 指令弹幕（#给/#炸）入看板（待确认）
 *  - 助手确认回复命中后标记「有效」
 *  - 超过确认窗口未确认的指令标记「未确认」
 * @param {import('vue').Ref<Object>} options - 页面配置（assistantName/members/confirmTimeout/threshold）
 * @returns {{connectWs: Function, checkTimeouts: Function, commandList: import('vue').Ref<Array>, isConnected: import('vue').Ref<boolean>, reconnectCount: import('vue').Ref<number>}}
 */
export function useLvjiangWs(options) {
  let ws = null;
  const stt = new STT();

  const commandList = ref([]);
  const isConnected = ref(false);
  const reconnectCount = ref(0);

  // 已处理消息ID集合，用于去重
  const processedIds = new Set();

  let reconnectTimer = null;
  let heartbeatTimer = null;
  let timeoutTimer = null;
  let lastHeartbeatTime = 0;

  const getOptions = () => (options && options.value ? options.value : {});
  const getMembers = () => getOptions().members || [];
  const getAssistantName = () =>
    String(getOptions().assistantName || '').trim();
  const getTimeoutMs = () => {
    const seconds = Number(getOptions().confirmTimeout);
    return (Number.isFinite(seconds) && seconds > 0 ? seconds : 60) * 1000;
  };
  const getThreshold = () => {
    const threshold = Number(getOptions().threshold);
    return Number.isFinite(threshold) && threshold > 0 ? threshold : 100;
  };

  /**
   * 清理所有资源
   */
  const cleanupResources = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (timeoutTimer) {
      clearInterval(timeoutTimer);
      timeoutTimer = null;
    }
  };

  /**
   * 将指令弹幕加入看板
   * @param {Object} data - chatmsg 数据
   * @param {Object} command - 解析后的指令 {type, member, value}
   */
  const pushCommand = (data, command) => {
    const item = {
      id: data.cid || `${Date.now()}${Math.random()}`,
      boss: String(data.nn == null ? '' : data.nn).trim(),
      type: command.type,
      member: command.member,
      value: command.value,
      rawText: data.txt,
      timestamp: Date.now(),
      status: 'pending',
      confirmedAt: null,
      confirmInfo: null,
      isHandled: false,
    };

    if (commandList.value.length + 1 > getThreshold()) {
      commandList.value.shift();
    }
    commandList.value.push(item);
  };

  /**
   * 处理助手确认回复
   * @param {string} text - 助手弹幕原文
   */
  const handleReply = text => {
    const reply = parseAssistantReply(text, getMembers());
    if (!reply) {
      console.log('[驴酱团播] 无法解析的助手弹幕，已忽略:', text);
      return;
    }

    const pending = commandList.value.filter(item => item.status === 'pending');
    const hit = matchReply(reply, pending);
    if (!hit) {
      console.log('[驴酱团播] 助手弹幕未匹配到对应指令，已忽略:', text);
      return;
    }

    hit.status = 'valid';
    hit.confirmedAt = Date.now();
    hit.confirmInfo = { value: reply.value, remaining: reply.remaining };
  };

  const handleMsg = msg => {
    const data = stt.deserialize(msg);
    if (!data || data.type !== 'chatmsg') {
      return;
    }

    // 去重
    const msgId = data.cid || `${Date.now()}${Math.random()}`;
    if (processedIds.has(msgId)) {
      return;
    }
    processedIds.add(msgId);

    const nn = String(data.nn == null ? '' : data.nn).trim();
    const txt = data.txt || '';

    // 助手确认回复
    if (nn !== '' && nn === getAssistantName()) {
      handleReply(txt);
      return;
    }

    // 指令弹幕
    const command = parseCommand(txt, getMembers());
    if (command) {
      pushCommand(data, command);
    }
  };

  /**
   * 扫描并标记超时未确认的指令
   * @param {number} now - 当前时间戳（毫秒），默认取系统时间
   */
  const checkTimeouts = (now = Date.now()) => {
    const deadline = getTimeoutMs();
    commandList.value.forEach(item => {
      if (item.status === 'pending' && now - item.timestamp > deadline) {
        item.status = 'unconfirmed';
      }
    });
  };

  /**
   * 启动心跳检测
   * @param {string} rid - 房间号
   */
  const startHeartbeat = rid => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    heartbeatTimer = setInterval(() => {
      if (Date.now() - lastHeartbeatTime > HEARTBEAT_INTERVAL * 2) {
        reconnectCount.value++;
        reconnectWs(rid);
      }
    }, HEARTBEAT_INTERVAL);
  };

  /**
   * 计算重连间隔，使用指数退避策略
   * @returns {number} 重连间隔时间（毫秒）
   */
  const calculateReconnectInterval = () => {
    const interval = Math.min(
      BASE_RECONNECT_INTERVAL * Math.pow(2, reconnectCount.value - 1),
      MAX_RECONNECT_INTERVAL
    );
    return interval + Math.random() * 1000;
  };

  /**
   * 重新连接 WebSocket
   * @param {string} rid - 房间号
   */
  const reconnectWs = rid => {
    if (reconnectCount.value >= MAX_RECONNECT_ATTEMPTS) {
      isConnected.value = false;
      return;
    }
    cleanupResources();
    const interval = calculateReconnectInterval();
    reconnectTimer = setTimeout(() => {
      connectWs(rid);
    }, interval);
  };

  /**
   * 建立弹幕连接
   * @param {string} rid - 房间号
   */
  const connectWs = rid => {
    if (!rid || rid === '') {
      return;
    }

    cleanupResources();

    try {
      ws = new Ex_WebSocket_UnLogin(
        rid,
        msg => {
          lastHeartbeatTime = Date.now();
          if (!isConnected.value) {
            isConnected.value = true;
            reconnectCount.value = 0;
            startHeartbeat(rid);
          }
          handleMsg(msg);
        },
        () => {
          isConnected.value = false;
          reconnectCount.value++;
          reconnectWs(rid);
        }
      );

      ws.onclose = () => {
        isConnected.value = false;
        reconnectCount.value++;
        reconnectWs(rid);
      };
      ws.onerror = () => {
        isConnected.value = false;
      };

      // 启动超时扫描
      timeoutTimer = setInterval(() => checkTimeouts(), TIMEOUT_SCAN_INTERVAL);
    } catch {
      isConnected.value = false;
      reconnectCount.value++;
      reconnectWs(rid);
    }
  };

  return {
    connectWs,
    checkTimeouts,
    commandList,
    isConnected,
    reconnectCount,
  };
}
