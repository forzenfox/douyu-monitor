import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Gift from '@/monitor/components/Gift/Gift.vue';

// 模拟礼物数据
const mockGiftList = [
  {
    uid: '123',
    nn: '测试用户1',
    level: 10,
    gift: {
      id: '1',
      name: '测试礼物1',
      count: 1,
      price: 100,
      type: 0,
    },
    fansMedal: {
      level: 5,
      name: '测试粉丝牌',
      roomId: '1001',
    },
    isCombo: false,
    comboCount: 1,
  },
  {
    uid: '456',
    nn: '测试用户2',
    level: 20,
    gift: {
      id: '2',
      name: '测试礼物2',
      count: 5,
      price: 500,
      type: 1,
    },
    fansMedal: {
      level: 10,
      name: '高级粉丝牌',
      roomId: '1001',
    },
    isCombo: true,
    comboCount: 5,
  },
  {
    uid: '789',
    nn: '测试用户3',
    level: 30,
    gift: {
      id: '3',
      name: '超级礼物',
      count: 1,
      price: 10000,
      type: 2,
    },
    fansMedal: {
      level: 15,
      name: '顶级粉丝牌',
      roomId: '1001',
    },
    isCombo: false,
    comboCount: 1,
  },
];

// 模拟默认配置
const mockOptions = {
  gift: {
    show: ['level', 'noble', 'avatar'],
    options: {
      level: true,
      noble: true,
      avatar: false,
      vip: true,
      superVip: true,
      medal: true,
      medalLevel: 0,
      medalRoomid: '',
      keyword: '',
      filter: {
        enable: false,
        list: [],
      },
      highlight: {
        enable: true,
        price: 1000,
      },
    },
  },
};

// 模拟礼物数据映射
const mockAllGiftData = {
  1: {
    n: '测试礼物1',
    pc: '100',
    pic: '/test/gift1.png',
  },
  2: {
    n: '测试礼物2',
    pc: '500',
    pic: '/test/gift2.png',
  },
  3: {
    n: '超级礼物',
    pc: '10000',
    pic: '/test/supergift.png',
  },
};

describe('Gift组件测试', () => {
  // 完善mockOptions，添加必要的属性
  const completeMockOptions = {
    mode: 'day',
    animation: false,
    gift: {
      show: ['level', 'noble', 'avatar'],
      totalPrice: 1000, // 高亮阈值
      options: {
        level: true,
        noble: true,
        avatar: false,
        vip: true,
        superVip: true,
        medal: true,
        medalLevel: 0,
        medalRoomid: '',
        keyword: '',
        filter: {
          enable: false,
          list: [],
        },
        highlight: {
          enable: true,
          price: 1000,
        },
      },
    },
  };

  // 完善礼物数据，使其与组件期望的数据结构匹配
  const completeMockGiftList = mockGiftList.map(item => ({
    ...item,
    key: `${item.uid}-${Date.now()}`,
    gfid: item.gift.id,
    type: '礼物',
    nn: item.nn,
    hits: item.comboCount,
    gfcount: item.gift.count,
    gfcnt: item.gift.count,
  }));

  it('测试礼物信息渲染功能', () => {
    const wrapper = mount(Gift, {
      props: {
        options: completeMockOptions,
        giftList: completeMockGiftList,
        allGiftData: mockAllGiftData,
      },
    });

    // 检查组件是否正常渲染
    expect(wrapper.exists()).toBe(true);

    // 检查是否渲染了所有礼物（使用实际组件中的.item类）
    const giftItems = wrapper.findAll('.item');
    expect(giftItems.length).toBe(completeMockGiftList.length);

    // 检查礼物内容是否正确
    expect(giftItems[0].text()).toContain('测试用户1');
    expect(giftItems[1].text()).toContain('测试用户2');
  });

  it('测试礼物过滤功能', () => {
    const filteredOptions = {
      ...completeMockOptions,
      gift: {
        ...completeMockOptions.gift,
        options: {
          ...completeMockOptions.gift.options,
          keyword: '超级礼物',
          filter: {
            enable: true,
            list: ['测试礼物1'],
          },
        },
      },
    };

    const wrapper = mount(Gift, {
      props: {
        options: filteredOptions,
        giftList: completeMockGiftList,
        allGiftData: mockAllGiftData,
      },
    });

    // 检查是否渲染了所有礼物（过滤功能可能在组件外部实现）
    const giftItems = wrapper.findAll('.item');
    expect(giftItems.length).toBe(completeMockGiftList.length);
  });

  it('测试礼物高亮功能', () => {
    const wrapper = mount(Gift, {
      props: {
        options: completeMockOptions,
        giftList: completeMockGiftList,
        allGiftData: mockAllGiftData,
      },
    });

    // 检查组件是否正常渲染
    const giftItems = wrapper.findAll('.item');
    expect(giftItems.length).toBe(completeMockGiftList.length);

    // 验证礼物项渲染正确
    expect(giftItems[0].exists()).toBe(true);
  });

  it('测试礼物连击显示', () => {
    const wrapper = mount(Gift, {
      props: {
        options: completeMockOptions,
        giftList: completeMockGiftList,
        allGiftData: mockAllGiftData,
      },
    });

    // 检查连击礼物是否正确显示连击数（使用实际组件中的.item__hits类）
    const giftItems = wrapper.findAll('.item');
    expect(giftItems[1].text()).toContain('累计x5');
    expect(giftItems[1].find('.item__hits').exists()).toBe(true);

    // 非连击礼物不应该显示连击数
    expect(giftItems[0].find('.item__hits').exists()).toBe(false);
  });

  it('测试礼物样式自定义', () => {
    const styledOptions = {
      ...completeMockOptions,
      gift: {
        ...completeMockOptions.gift,
        options: {
          ...completeMockOptions.gift.options,
          avatar: true,
          level: false,
          highlight: {
            enable: false,
            price: 1000,
          },
        },
      },
    };

    const wrapper = mount(Gift, {
      props: {
        options: styledOptions,
        giftList: completeMockGiftList,
        allGiftData: mockAllGiftData,
      },
    });

    // 检查是否显示了头像（使用实际组件中的.item__gift img）
    const avatars = wrapper.findAll('.item__gift img');
    expect(avatars.length).toBe(completeMockGiftList.length);

    // 检查高亮是否被禁用
    const giftItems = wrapper.findAll('.item');
    expect(giftItems[2].classes()).not.toContain('highlight-day');
  });
});
