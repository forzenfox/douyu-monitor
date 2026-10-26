import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UserDanmakuConfig from '../../../src/monitor/components/UserDanmaku/UserDanmakuConfig.vue';

const buildOptions = () => ({
  switch: ['userDanmaku'],
  userDanmaku: {
    users: [
      { id: 'user-1', name: '主播小号', enabled: true },
      { id: 'user-2', name: '场控', enabled: false },
    ],
  },
});

describe('UserDanmakuConfig Component', () => {
  it('渲染已配置的用户列表', () => {
    const wrapper = mount(UserDanmakuConfig, {
      props: { options: buildOptions() },
    });

    const items = wrapper.findAll('.user-item');
    expect(items).toHaveLength(2);
    expect(items[0].find('.user-name').text()).toBe('主播小号');
    expect(items[1].find('.user-name').text()).toBe('场控');
    expect(items[0].find('.user-checkbox').element.checked).toBe(true);
    expect(items[1].find('.user-checkbox').element.checked).toBe(false);
  });

  it('添加用户后派发更新事件', async () => {
    const options = buildOptions();
    const wrapper = mount(UserDanmakuConfig, {
      props: { options },
    });

    await wrapper.find('.add-user-input-field').setValue('新用户');
    await wrapper.find('.add-btn').trigger('click');

    const emitted = wrapper.emitted('update:options');
    expect(emitted).toBeTruthy();
    const nextOptions = emitted[emitted.length - 1][0];
    expect(nextOptions.userDanmaku.users).toHaveLength(3);
    expect(nextOptions.userDanmaku.users[2]).toMatchObject({
      name: '新用户',
      enabled: true,
    });
    // 原有配置不被破坏
    expect(nextOptions.switch).toEqual(['userDanmaku']);
  });

  it('删除用户后派发更新事件', async () => {
    const options = buildOptions();
    const wrapper = mount(UserDanmakuConfig, {
      props: { options },
    });

    await wrapper.findAll('.delete-btn')[0].trigger('click');

    const emitted = wrapper.emitted('update:options');
    const nextOptions = emitted[emitted.length - 1][0];
    expect(nextOptions.userDanmaku.users).toHaveLength(1);
    expect(nextOptions.userDanmaku.users[0].name).toBe('场控');
  });

  it('切换启用状态后派发更新事件', async () => {
    const options = buildOptions();
    const wrapper = mount(UserDanmakuConfig, {
      props: { options },
    });

    await wrapper.findAll('.user-checkbox')[0].setValue(false);

    const emitted = wrapper.emitted('update:options');
    const nextOptions = emitted[emitted.length - 1][0];
    expect(nextOptions.userDanmaku.users[0].enabled).toBe(false);
  });

  it('无用户时展示空态提示', () => {
    const options = buildOptions();
    options.userDanmaku.users = [];
    const wrapper = mount(UserDanmakuConfig, {
      props: { options },
    });

    expect(wrapper.find('.empty-tip').text()).toBe(
      '暂无指定用户，请在下方添加'
    );
  });
});
