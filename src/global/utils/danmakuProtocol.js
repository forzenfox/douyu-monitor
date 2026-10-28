import { getRandom } from './index.js';

// 斗鱼弹幕协议消息类型：客户端消息固定为 689
const MSG_TYPE = 689;

// 心跳包内容，服务端会原样回包，用于确认连接活性
export const HEARTBEAT_PACKET_STR = 'type@=mrkl/';

/**
 * 将字符串按 UTF-8 编码为字节数组
 * @param {string} str - 待编码字符串
 * @returns {number[]} 字节数组
 */
export function stringToByte(str) {
  const bytes = [];
  const len = str.length;
  for (let i = 0; i < len; i++) {
    let c = str.charCodeAt(i);
    // 代理对合并为完整码点，保证 emoji 等字符按标准 UTF-8 编码
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < len) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        c = ((c - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i++;
      }
    }
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
}

/**
 * 按斗鱼协议封装一个客户端消息包
 * @param {string} str - 消息内容
 * @returns {Uint8Array} 协议包
 */
export function createPacket(str) {
  const bytes = stringToByte(str);
  const buffer = new Uint8Array(bytes.length + 13);
  const content = new Uint8Array(bytes.length);
  for (let i = 0; i < content.length; i++) {
    content[i] = bytes[i];
  }
  const view = new DataView(buffer.buffer);
  const payloadLength = bytes.length + 9;
  view.setUint32(0, payloadLength, true);
  view.setUint32(4, payloadLength, true);
  view.setUint32(8, MSG_TYPE, true);
  buffer.set(content, 12);
  return buffer;
}

/**
 * 从原始文本中拆包，并过滤登录回包/心跳回包等短包
 * @param {string} text - 已按文本解码的原始报文
 * @returns {string[]} 业务消息包
 */
export function extractPackets(text) {
  if (!text) return [];
  return String(text)
    .split('\0')
    .filter(packet => packet.length > 12);
}

/**
 * 生成斗鱼弹幕 WebSocket 地址（850 端口段 2~5 号节点做负载均衡）
 * @returns {string} WebSocket 地址
 */
export function getDanmakuUrl() {
  return 'wss://danmuproxy.douyu.com:850' + String(getRandom(2, 5));
}
