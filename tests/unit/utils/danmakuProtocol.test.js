import { describe, it, expect } from 'vitest';
import {
  stringToByte,
  createPacket,
  extractPackets,
  getDanmakuUrl,
  HEARTBEAT_PACKET_STR,
} from '@/global/utils/danmakuProtocol.js';

describe('danmakuProtocol', () => {
  describe('stringToByte', () => {
    it('ASCII 字符串按 UTF-8 单字节编码', () => {
      expect(stringToByte('abc')).toEqual([97, 98, 99]);
    });

    it('中文按 UTF-8 三字节编码', () => {
      expect(stringToByte('弹')).toEqual([0xe5, 0xbc, 0xb9]);
    });

    it('emoji 按 UTF-8 四字节编码', () => {
      expect(stringToByte('😀')).toEqual([0xf0, 0x9f, 0x98, 0x80]);
    });
  });

  describe('createPacket', () => {
    it('生成斗鱼协议包：长度字段、消息类型与内容位置正确', () => {
      const content = HEARTBEAT_PACKET_STR;
      const bytes = stringToByte(content);
      const packet = createPacket(content);

      expect(packet).toBeInstanceOf(Uint8Array);
      expect(packet.length).toBe(bytes.length + 13);

      const view = new DataView(
        packet.buffer,
        packet.byteOffset,
        packet.byteLength
      );
      expect(view.getUint32(0, true)).toBe(bytes.length + 9);
      expect(view.getUint32(4, true)).toBe(bytes.length + 9);
      expect(view.getUint32(8, true)).toBe(689);
      expect(Array.from(packet.slice(12, 12 + bytes.length))).toEqual(bytes);
    });
  });

  describe('extractPackets', () => {
    it('按 \\0 分包并过滤心跳包（长度 <= 12）', () => {
      const text = 'type@=chatmsg/nn@=a/txt@=hi/\0type@=mrkl/\0';
      expect(extractPackets(text)).toEqual(['type@=chatmsg/nn@=a/txt@=hi/']);
    });

    it('空内容返回空数组', () => {
      expect(extractPackets('')).toEqual([]);
      expect(extractPackets(undefined)).toEqual([]);
    });

    it('多个业务包按顺序返回', () => {
      const text = 'type@=chatmsg/txt@=1/\0type@=uenter/nn@=b/\0';
      expect(extractPackets(text)).toEqual([
        'type@=chatmsg/txt@=1/',
        'type@=uenter/nn@=b/',
      ]);
    });
  });

  describe('getDanmakuUrl', () => {
    it('使用 850 端口段的 2~5 号负载均衡节点', () => {
      for (let i = 0; i < 20; i++) {
        expect(getDanmakuUrl()).toMatch(
          /^wss:\/\/danmuproxy\.douyu\.com:850[2-5]$/
        );
      }
    });
  });

  it('心跳包字符串为 mrkl', () => {
    expect(HEARTBEAT_PACKET_STR).toBe('type@=mrkl/');
  });
});
