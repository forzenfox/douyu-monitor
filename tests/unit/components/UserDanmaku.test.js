import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import UserDanmaku from '../../../src/monitor/components/UserDanmaku/UserDanmaku.vue';

const baseOptions = {
  mode: 'day',
  animation: true,
  align: 'left',
  order: { userDanmaku: 5 },
  size: { userDanmaku: 17 },
};

const buildList = () => [
  {
    id: 'ud-1',
    userId: 'u-1',
    userName: '主播小号',
    userLevel: 20,
    content: '第一条消息',
    timestamp: Date.now(),
    isExpired: false,
    userInfo: {
      avatar: 'avatar_v3/202001/abc',
      fansLevel: 8,
      nobleLevel: 0,
      isRoomAdmin: false,
    },
  },
  {
    id: 'ud-2',
    userId: 'u-2',
    userName: '场控',
    userLevel: 30,
    content: '第二条消息',
    timestamp: Date.now(),
    isExpired: false,
    userInfo: {
      avatar: 'avatar_v3/202002/def',
      fansLevel: 12,
      nobleLevel: 2,
      isRoomAdmin: true,
    },
  },
];

describe('UserDanmaku Component', () => {
  it('渲染指定用户弹幕列表', () => {
    const wrapper = mount(UserDanmaku, {
      props: {
        options: baseOptions,
        userDanmakuList: buildList(),
        maxOrder: 5,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('user-danmaku');

    const items = wrapper.findAll('.user-danmaku-item');
    expect(items).toHaveLength(2);
    expect(items[0].find('.username').text()).toBe('主播小号');
    expect(items[0].find('.content').text()).toBe('第一条消息');
    expect(items[1].find('.username').text()).toBe('场控');
    expect(items[1].find('.content').text()).toBe('第二条消息');
    expect(items[0].find('.user-avatar').exists()).toBe(true);
  });

  it('无数据时展示空态提示', () => {
    const wrapper = mount(UserDanmaku, {
      props: {
        options: baseOptions,
        userDanmakuList: [],
        maxOrder: 5,
      },
    });

    expect(wrapper.find('.empty-tip').text()).toBe('暂无指定用户弹幕');
    expect(wrapper.findAll('.user-danmaku-item')).toHaveLength(0);
  });

  it('点击弹幕后标记为已过期并变灰', async () => {
    const list = ref(buildList());
    const wrapper = mount(UserDanmaku, {
      props: {
        options: baseOptions,
        userDanmakuList: list.value,
        maxOrder: 5,
      },
    });

    expect(list.value[0].isExpired).toBe(false);
    await wrapper.findAll('.user-danmaku-item')[0].trigger('click');
    await nextTick();

    expect(list.value[0].isExpired).toBe(true);
    expect(wrapper.findAll('.user-danmaku-item')[0].classes()).toContain(
      'user-danmaku-item--expired'
    );
    expect(wrapper.findAll('.user-danmaku-item')[1].classes()).not.toContain(
      'user-danmaku-item--expired'
    );
  });

  it('已过期弹幕初始即应用灰化样式', () => {
    const list = buildList();
    list[0].isExpired = true;
    const wrapper = mount(UserDanmaku, {
      props: {
        options: baseOptions,
        userDanmakuList: list,
        maxOrder: 5,
      },
    });

    expect(wrapper.findAll('.user-danmaku-item')[0].classes()).toContain(
      'user-danmaku-item--expired'
    );
  });
});
