import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import Board from '@/lvjiang/components/Board/Board.vue';
import { defaultLvjiangOptions } from '@/lvjiang/options.js';

// 固定为本地时间 12:03:45
const TS = new Date(2026, 0, 1, 12, 3, 45).getTime();

const baseOptions = () => ({
  ...JSON.parse(JSON.stringify(defaultLvjiangOptions)),
});

const buildList = () => [
  {
    id: 'i1',
    boss: '老板A',
    type: 'give',
    member: '光阴',
    value: 1000,
    rawText: '#给光阴1000',
    timestamp: TS,
    status: 'pending',
    confirmedAt: null,
    confirmInfo: null,
    isHandled: false,
  },
  {
    id: 'i2',
    boss: '老板B',
    type: 'give',
    member: '豆包',
    value: 2000,
    rawText: '#给豆包2000',
    timestamp: TS,
    status: 'valid',
    confirmedAt: TS + 3000,
    confirmInfo: { value: 2000, remaining: 1533.4 },
    isHandled: false,
  },
  {
    id: 'i3',
    boss: '老板C',
    type: 'bomb',
    member: '白晶晶',
    value: 1,
    rawText: '#炸白晶晶1',
    timestamp: TS,
    status: 'unconfirmed',
    confirmedAt: null,
    confirmInfo: null,
    isHandled: false,
  },
];

describe('Board 组件', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('渲染三种状态标记（时钟/绿勾/灰标）', () => {
    const wrapper = mount(Board, {
      props: { options: baseOptions(), commandList: buildList() },
    });

    const items = wrapper.findAll('.lvjiang-item');
    expect(items).toHaveLength(3);

    expect(items[0].classes()).toContain('status-pending');
    expect(items[0].find('.status-text').text()).toBe('待确认');
    expect(items[0].find('.status-icon').text()).toBe('⏳');

    expect(items[1].classes()).toContain('status-valid');
    expect(items[1].find('.status-text').text()).toBe('有效');
    expect(items[1].find('.status-icon').text()).toBe('✓');

    expect(items[2].classes()).toContain('status-unconfirmed');
    expect(items[2].find('.status-text').text()).toBe('未确认');
    expect(items[2].find('.status-icon').text()).toBe('—');
  });

  it('给分与炸分使用不同强调色类名', () => {
    const wrapper = mount(Board, {
      props: { options: baseOptions(), commandList: buildList() },
    });
    const items = wrapper.findAll('.lvjiang-item');
    expect(items[0].classes()).toContain('type-give');
    expect(items[2].classes()).toContain('type-bomb');
  });

  it('展示老板昵称、指令原文与接收时间', () => {
    const wrapper = mount(Board, {
      props: { options: baseOptions(), commandList: buildList() },
    });
    const first = wrapper.findAll('.lvjiang-item')[0];
    expect(first.find('.boss').text()).toBe('老板A');
    expect(first.find('.raw-text').text()).toBe('#给光阴1000');
    expect(first.find('.time').text()).toBe('12:03:45');
  });

  it('有效条目展示确认详情与确认耗时', () => {
    const wrapper = mount(Board, {
      props: { options: baseOptions(), commandList: buildList() },
    });
    const valid = wrapper.findAll('.lvjiang-item')[1];
    expect(valid.find('.confirm-detail').text()).toContain('转给豆包 2000');
    expect(valid.find('.confirm-detail').text()).toContain('剩余 1533.4');
    expect(valid.find('.confirm-cost').text()).toBe('+3s');
  });

  it('关闭确认耗时展示后不再渲染耗时', () => {
    const options = baseOptions();
    options.showConfirmCost = false;
    const wrapper = mount(Board, {
      props: { options, commandList: buildList() },
    });
    const valid = wrapper.findAll('.lvjiang-item')[1];
    expect(valid.find('.confirm-cost').exists()).toBe(false);
    expect(valid.find('.confirm-detail').exists()).toBe(true);
  });

  it('无数据时展示空态提示', () => {
    const wrapper = mount(Board, {
      props: { options: baseOptions(), commandList: [] },
    });
    expect(wrapper.find('.empty-tip').text()).toBe('暂无团播指令');
    expect(wrapper.findAll('.lvjiang-item')).toHaveLength(0);
  });

  it('点击条目置灰（标记为已处理）', async () => {
    const list = ref(buildList());
    const wrapper = mount(Board, {
      props: { options: baseOptions(), commandList: list.value },
    });

    await wrapper.findAll('.lvjiang-item')[0].trigger('click');
    expect(list.value[0].isHandled).toBe(true);
    expect(wrapper.findAll('.lvjiang-item')[0].classes()).toContain(
      'lvjiang-item--handled'
    );
  });

  it('开启置灰自动移除后，点击条目会在设定时间后移除', async () => {
    vi.useFakeTimers();
    const options = baseOptions();
    options.autoRemoveHandled = true;
    options.autoRemoveDelay = 30;
    const list = ref(buildList());
    const wrapper = mount(Board, {
      props: { options, commandList: list.value },
    });

    await wrapper.findAll('.lvjiang-item')[0].trigger('click');
    expect(list.value).toHaveLength(3);

    await vi.advanceTimersByTimeAsync(29999);
    expect(list.value).toHaveLength(3);
    await vi.advanceTimersByTimeAsync(1);
    expect(list.value).toHaveLength(2);

    wrapper.unmount();
  });
});

describe('defaultLvjiangOptions', () => {
  it('包含评审确定的默认配置', () => {
    expect(defaultLvjiangOptions).toMatchObject({
      assistantName: '新驴酱团播小助手',
      members: ['145'],
      confirmTimeout: 60,
      showConfirmCost: true,
      autoRemoveHandled: false,
      autoRemoveDelay: 30,
      threshold: 100,
    });
  });
});
