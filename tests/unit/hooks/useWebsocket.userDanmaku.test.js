import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import {
  useWebsocket,
  matchUserDanmaku,
} from '@/monitor/hooks/useWebsocket.js';

// Mock WebSocket，暴露 onMessage 供测试直接触发
vi.mock('@/global/utils/websocket.js', () => ({
  Ex_WebSocket_UnLogin: vi.fn().mockImplementation(function (rid, onMessage) {
    globalThis.__userDanmakuOnMessage = onMessage;
    this.close = vi.fn();
    this.onclose = null;
    this.onerror = null;
  }),
}));

// Mock STT
vi.mock('@/global/utils/stt.js', () => {
  class MockSTT {
    constructor() {
      this.deserialize = vi.fn(msg => {
        const result = {};
        msg.split('/').forEach(item => {
          if (item) {
            const [key, value] = item.split('@=');
            if (key && value !== undefined) {
              result[key] = value;
            }
          }
        });
        return result;
      });
    }
  }

  return { STT: MockSTT };
});

vi.mock('@/global/utils/speak.js', () => ({
  speakText: vi.fn(),
}));

vi.mock('@/global/utils', () => ({
  getStrMiddle: vi.fn((str, before, after) => {
    const start = str.indexOf(before);
    if (start === -1) return null;
    const end = str.indexOf(after, start + before.length);
    if (end === -1) return null;
    return str.substring(start + before.length, end);
  }),
}));

vi.mock('@/global/utils/dydata/nobleData.js', () => ({
  nobleData: {
    1: { name: '男爵' },
    2: { name: '子爵' },
    3: { name: '伯爵' },
    4: { name: '侯爵' },
    5: { name: '公爵' },
  },
}));

const createOptions = overrides => ({
  switch: ['danmaku', 'userDanmaku'],
  threshold: 10,
  isSaveData: false,
  danmaku: {
    ban: {
      level: 0,
      keywords: '',
      nicknames: '',
      isFilterRepeat: false,
    },
  },
  superchat: {
    keyword: '#sc',
    speak: false,
    options: [
      {
        minPrice: 0,
        bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' },
      },
    ],
  },
  commandDanmaku: {
    prefix: '#',
    speak: false,
    keywords: [],
  },
  userDanmaku: {
    users: [{ id: 'user-1', name: '主播小号', enabled: true }],
  },
  ...overrides,
});

const buildChatmsg = ({
  nn = '主播小号',
  txt = '你好',
  cid = '1001',
  uid = '67890',
  level = '10',
} = {}) =>
  `type@=chatmsg/rid@=123/nn@=${nn}/txt@=${txt}/cid@=${cid}/uid@=${uid}/level@=${level}/ic@=avatar_v3@S1@Sabc/bl@=8/nl@=3/rg@=4/`;

describe('matchUserDanmaku', () => {
  it('精确匹配昵称（忽略首尾空格）', () => {
    const config = {
      users: [{ id: 'u1', name: ' 主播小号 ', enabled: true }],
    };
    expect(matchUserDanmaku(config, '主播小号')).toBe(true);
    expect(matchUserDanmaku(config, ' 主播小号 ')).toBe(true);
  });

  it('不做模糊匹配', () => {
    const config = { users: [{ id: 'u1', name: '主播', enabled: true }] };
    expect(matchUserDanmaku(config, '主播小号')).toBe(false);
    expect(matchUserDanmaku(config, '小主播')).toBe(false);
  });

  it('忽略未启用的用户', () => {
    const config = {
      users: [{ id: 'u1', name: '主播小号', enabled: false }],
    };
    expect(matchUserDanmaku(config, '主播小号')).toBe(false);
  });

  it('配置为空或昵称为空时返回 false', () => {
    expect(matchUserDanmaku(undefined, '主播小号')).toBe(false);
    expect(matchUserDanmaku({ users: [] }, '主播小号')).toBe(false);
    expect(
      matchUserDanmaku(
        { users: [{ id: 'u1', name: '主播小号', enabled: true }] },
        ''
      )
    ).toBe(false);
    expect(
      matchUserDanmaku({ users: [{ id: 'u1', name: '', enabled: true }] }, '')
    ).toBe(false);
  });

  it('支持配置多个用户', () => {
    const config = {
      users: [
        { id: 'u1', name: '主播小号', enabled: true },
        { id: 'u2', name: '场控', enabled: true },
      ],
    };
    expect(matchUserDanmaku(config, '场控')).toBe(true);
    expect(matchUserDanmaku(config, '路人')).toBe(false);
  });
});

describe('useWebsocket 指定用户弹幕', () => {
  let options;
  let allGiftData;

  beforeEach(() => {
    vi.clearAllMocks();
    window.rid = '123';
    options = ref(createOptions());
    allGiftData = ref({});
  });

  const dispatch = msg => {
    globalThis.__userDanmakuOnMessage(msg);
  };

  it('初始化包含 userDanmakuList', () => {
    const { userDanmakuList } = useWebsocket(options, allGiftData);
    expect(userDanmakuList.value).toEqual([]);
  });

  it('关闭普通弹幕时仍能抓取指定用户弹幕', () => {
    options.value.switch = ['userDanmaku'];
    const { connectWs, userDanmakuList, danmakuList } = useWebsocket(
      options,
      allGiftData
    );
    connectWs('123');
    dispatch(buildChatmsg());

    expect(danmakuList.value).toHaveLength(0);
    expect(userDanmakuList.value).toHaveLength(1);
    expect(userDanmakuList.value[0]).toMatchObject({
      id: '1001',
      userId: '67890',
      userName: '主播小号',
      userLevel: 10,
      content: '你好',
      isExpired: false,
      userInfo: {
        avatar: 'avatar_v3@S1@Sabc',
        fansLevel: 8,
        nobleLevel: 3,
        isRoomAdmin: true,
      },
    });
  });

  it('普通弹幕屏蔽规则不影响指定用户抓取', () => {
    options.value.danmaku.ban.level = 100;
    options.value.danmaku.ban.keywords = '你好';
    options.value.danmaku.ban.nicknames = '主播';
    const { connectWs, userDanmakuList, danmakuList } = useWebsocket(
      options,
      allGiftData
    );
    connectWs('123');
    dispatch(buildChatmsg());

    expect(danmakuList.value).toHaveLength(0);
    expect(userDanmakuList.value).toHaveLength(1);
  });

  it('未匹配的用户不会进入指定用户弹幕', () => {
    const { connectWs, userDanmakuList } = useWebsocket(options, allGiftData);
    connectWs('123');
    dispatch(buildChatmsg({ nn: '路人甲', cid: '2002' }));

    expect(userDanmakuList.value).toHaveLength(0);
  });

  it('超过 threshold 时丢弃最早的一条', () => {
    options.value.threshold = 1;
    const { connectWs, userDanmakuList } = useWebsocket(options, allGiftData);
    connectWs('123');
    dispatch(buildChatmsg({ txt: '第一条', cid: '3001' }));
    dispatch(buildChatmsg({ txt: '第二条', cid: '3002' }));

    expect(userDanmakuList.value).toHaveLength(1);
    expect(userDanmakuList.value[0].content).toBe('第二条');
  });

  it('开启数据保存时记录原始消息', () => {
    options.value.isSaveData = true;
    const { connectWs, userDanmakuListSave } = useWebsocket(
      options,
      allGiftData
    );
    connectWs('123');
    const msg = buildChatmsg({ cid: '4001' });
    dispatch(msg);

    expect(userDanmakuListSave).toHaveLength(1);
    expect(userDanmakuListSave[0]).toBe(msg);
  });
});
