import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useLvjiangWs } from '@/lvjiang/hooks/useLvjiangWs.js';

// Mock WebSocket，暴露 onMessage 供测试直接触发
vi.mock('@/global/utils/websocket.js', () => ({
  Ex_WebSocket_UnLogin: vi
    .fn()
    .mockImplementation(function (rid, onMessage, onError, extra) {
      globalThis.__lvjiangOnMessage = onMessage;
      globalThis.__lvjiangExtra = extra;
      this.close = vi.fn();
    }),
}));

// Mock STT
vi.mock('@/global/utils/stt.js', () => {
  class MockSTT {
    deserialize(msg) {
      const result = {};
      String(msg)
        .split('/')
        .forEach(item => {
          if (!item) return;
          const [key, value] = item.split('@=');
          if (key && value !== undefined) {
            result[key] = value;
          }
        });
      return result;
    }
  }
  return { STT: MockSTT };
});

const ASSISTANT = '新驴酱团播小助手';

const createOptions = overrides => ({
  assistantName: ASSISTANT,
  members: ['145'],
  confirmTimeout: 60,
  threshold: 100,
  ...overrides,
});

const buildChatmsg = ({
  nn = '老板A',
  txt = '#给光阴1000',
  cid = '1001',
} = {}) => `type@=chatmsg/nn@=${nn}/txt@=${txt}/cid@=${cid}/`;

describe('useLvjiangWs', () => {
  let options;

  beforeEach(() => {
    vi.clearAllMocks();
    options = ref(createOptions());
  });

  const dispatch = msg => {
    globalThis.__lvjiangOnMessage(msg);
  };

  const setup = () => {
    const api = useLvjiangWs(options);
    api.connectWs('317422');
    return api;
  };

  it('连接状态由传输层状态同步', () => {
    const api = setup();

    globalThis.__lvjiangExtra.onStatus(true);
    expect(api.isConnected.value).toBe(true);

    globalThis.__lvjiangExtra.onStatus(false);
    expect(api.isConnected.value).toBe(false);
  });

  it('初始化指令列表为空', () => {
    const { commandList } = useLvjiangWs(options);
    expect(commandList.value).toEqual([]);
  });

  it('抓取给分指令入队，初始为待确认', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给光阴1000', cid: 'c1' }));

    expect(commandList.value).toHaveLength(1);
    expect(commandList.value[0]).toMatchObject({
      id: 'c1',
      boss: '老板A',
      type: 'give',
      member: '光阴',
      value: 1000,
      rawText: '#给光阴1000',
      status: 'pending',
      confirmedAt: null,
      confirmInfo: null,
      isHandled: false,
    });
  });

  it('抓取炸分指令入队', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#炸白晶晶1', cid: 'c2' }));
    expect(commandList.value[0]).toMatchObject({
      type: 'bomb',
      member: '白晶晶',
      value: 1,
    });
  });

  it('名单消歧：纯数字昵称正确解析', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给1451000', cid: 'c3' }));
    expect(commandList.value[0]).toMatchObject({ member: '145', value: 1000 });
  });

  it('收到给分确认回复后对应指令标记有效', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给豆包2000', cid: 'c4' }));
    dispatch(
      buildChatmsg({
        nn: ASSISTANT,
        txt: '@老板A，转给豆包2000温度值，剩余1533.4温度值',
        cid: 'r4',
      })
    );

    expect(commandList.value[0].status).toBe('valid');
    expect(commandList.value[0].confirmInfo).toEqual({
      value: 2000,
      remaining: 1533.4,
    });
    expect(commandList.value[0].confirmedAt).toBeTypeOf('number');
  });

  it('收到炸分确认回复后对应指令标记有效', () => {
    const { commandList } = setup();
    dispatch(
      buildChatmsg({ nn: '新驴酱丶张顺飞', txt: '#炸白晶晶1', cid: 'c5' })
    );
    dispatch(
      buildChatmsg({
        nn: ASSISTANT,
        txt: '@新驴酱丶张顺飞，炸白晶晶1温度值，剩余0.5温度值',
        cid: 'r5',
      })
    );
    expect(commandList.value[0].status).toBe('valid');
    expect(commandList.value[0].confirmInfo).toEqual({
      value: 1,
      remaining: 0.5,
    });
  });

  it('解析失败的指令弹幕不入看板（仅记录日志）', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给1000', cid: 'c6' }));
    expect(commandList.value).toHaveLength(0);
  });

  it('非指令弹幕不入看板', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '大家晚上好', cid: 'c7' }));
    expect(commandList.value).toHaveLength(0);
  });

  it('按 cid 去重', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给光阴1000', cid: 'dup' }));
    dispatch(buildChatmsg({ txt: '#给光阴1000', cid: 'dup' }));
    expect(commandList.value).toHaveLength(1);
  });

  it('超过消息上限时移除最旧一条', () => {
    options.value.threshold = 1;
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给光阴1000', cid: 't1' }));
    dispatch(buildChatmsg({ txt: '#给醋醋100', cid: 't2' }));
    expect(commandList.value).toHaveLength(1);
    expect(commandList.value[0].member).toBe('醋醋');
  });

  it('超过确认窗口的指令置为未确认，且不再被后续回复标记', () => {
    const { commandList, checkTimeouts } = setup();
    dispatch(buildChatmsg({ txt: '#给光阴1000', cid: 'to1' }));
    const ts = commandList.value[0].timestamp;

    // 未超时
    checkTimeouts(ts + 59000);
    expect(commandList.value[0].status).toBe('pending');
    // 超时
    checkTimeouts(ts + 61000);
    expect(commandList.value[0].status).toBe('unconfirmed');

    // 后续回复不应再标记
    dispatch(
      buildChatmsg({
        nn: ASSISTANT,
        txt: '@老板A，转给光阴1000温度值，剩余0温度值',
        cid: 'to2',
      })
    );
    expect(commandList.value[0].status).toBe('unconfirmed');
  });

  it('无法解析或无匹配的助手弹幕不改变任何状态', () => {
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给光阴1000', cid: 'm1' }));
    dispatch(
      buildChatmsg({
        nn: ASSISTANT,
        txt: '余额不足，请稍后再试',
        cid: 'm2',
      })
    );
    dispatch(
      buildChatmsg({
        nn: ASSISTANT,
        txt: '@别的老板，转给别的团员1温度值，剩余1温度值',
        cid: 'm3',
      })
    );
    expect(commandList.value[0].status).toBe('pending');
  });

  it('助手昵称可配置', () => {
    options.value.assistantName = '另一个助手';
    const { commandList } = setup();
    dispatch(buildChatmsg({ txt: '#给豆包2000', cid: 'n1' }));
    // 原昵称的弹幕不再视为确认回复
    dispatch(
      buildChatmsg({
        nn: ASSISTANT,
        txt: '@老板A，转给豆包2000温度值，剩余1温度值',
        cid: 'n2',
      })
    );
    expect(commandList.value[0].status).toBe('pending');

    // 新昵称的弹幕生效
    dispatch(
      buildChatmsg({
        nn: '另一个助手',
        txt: '@老板A，转给豆包2000温度值，剩余1温度值',
        cid: 'n3',
      })
    );
    expect(commandList.value[0].status).toBe('valid');
  });
});
