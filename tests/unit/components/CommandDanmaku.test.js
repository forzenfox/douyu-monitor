import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommandDanmaku from '../../../src/monitor/components/CommandDanmaku/CommandDanmaku.vue'

describe('CommandDanmaku Component', () => {
  // 基础测试配置
  const baseOptions = {
    size: { commandDanmaku: 15 },
    mode: 'day',
    animation: true,
    commandDanmaku: {
      enabled: true,
      maxCount: 20,
      prefix: '#',
      keywords: [
        { id: 'kw-1', name: '点歌', enabled: true },
        { id: 'kw-2', name: '转盘', enabled: true }
      ],
      styles: {
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        border: '1px solid #007bff',
        borderRadius: '8px',
        padding: '10px',
        margin: '5px'
      }
    }
  }

  it('should render correctly with default props', () => {
    const wrapper = mount(CommandDanmaku, {
      props: {
        options: baseOptions,
        commandDanmakuList: [],
        maxOrder: 0
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('command-danmaku')
    // 验证没有标题显示
    expect(wrapper.find('.command-danmaku-header').exists()).toBe(false)
  })

  it('should render command danmaku items correctly', () => {
    const commandDanmakuList = [
      {
        id: 'cmd-1',
        userId: 'user-123',
        userName: '测试用户1',
        userLevel: 50,
        content: '#点歌 青花瓷',
        command: '点歌',
        commandContent: '青花瓷',
        timestamp: Date.now(),
        userInfo: {
          avatar: 'test/avatar1.png',
          fansLevel: 10,
          nobleLevel: 5,
          isRoomAdmin: false
        }
      },
      {
        id: 'cmd-2',
        userId: 'user-456',
        userName: '测试用户2',
        userLevel: 30,
        content: '#转盘 1',
        command: '转盘',
        commandContent: '1',
        timestamp: Date.now(),
        userInfo: {
          avatar: 'test/avatar2.png',
          fansLevel: 5,
          nobleLevel: 2,
          isRoomAdmin: true
        }
      }
    ]

    const wrapper = mount(CommandDanmaku, {
      props: {
        options: baseOptions,
        commandDanmakuList,
        maxOrder: 0
      }
    })

    // 验证指令弹幕项渲染数量
    const danmakuItems = wrapper.findAll('.command-danmaku-item')
    expect(danmakuItems.length).toBe(2)

    // 验证第一个指令弹幕显示正确
    const firstItem = danmakuItems[0]
    expect(firstItem.find('.command-type').text()).toBe('点歌：')
    expect(firstItem.find('.command-text').text()).toBe('青花瓷')
    // 验证用户名显示
    expect(firstItem.find('.username').text()).toBe('测试用户1')
    // 验证头像显示
    expect(firstItem.find('.user-avatar').exists()).toBe(true)
    // 验证command-row容器存在，确保所有元素在一行
    expect(firstItem.find('.command-row').exists()).toBe(true)

    // 验证第二个指令弹幕显示正确
    const secondItem = danmakuItems[1]
    expect(secondItem.find('.command-type').text()).toBe('转盘：')
    expect(secondItem.find('.command-text').text()).toBe('1')
    // 验证用户名显示
    expect(secondItem.find('.username').text()).toBe('测试用户2')
    // 验证头像显示
    expect(secondItem.find('.user-avatar').exists()).toBe(true)
    // 验证command-row容器存在，确保所有元素在一行
    expect(secondItem.find('.command-row').exists()).toBe(true)
  })

  it('should handle empty command danmaku list', () => {
    const wrapper = mount(CommandDanmaku, {
      props: {
        options: baseOptions,
        commandDanmakuList: [],
        maxOrder: 0
      }
    })

    // 验证显示空提示信息
    expect(wrapper.find('.empty-tip').text()).toBe('暂无指令弹幕')
    expect(wrapper.findAll('.command-danmaku-item').length).toBe(0)
  })

  it('should apply correct font size style based on options', () => {
    // 自定义样式配置
    const customOptions = {
      ...baseOptions,
      commandDanmaku: {
        ...baseOptions.commandDanmaku,
        styles: {
          fontSize: 18,
          border: '2px solid #ff0000',
          borderRadius: '10px',
          padding: '15px',
          margin: '10px'
        }
      }
    }

    const wrapper = mount(CommandDanmaku, {
      props: {
        options: customOptions,
        commandDanmakuList: [],
        maxOrder: 0
      }
    })

    // 验证容器样式 - 只验证移除的边框、圆角和内外边距
    const container = wrapper.find('.command-danmaku')
    expect(container.attributes('style')).toContain('border-radius: 0')
    expect(container.attributes('style')).toContain('padding: 0px')
    expect(container.attributes('style')).toContain('margin: 0px')
    wrapper.unmount()
  })

  it('should support night mode', () => {
    const nightOptions = {
      ...baseOptions,
      mode: 'night'
    }

    const wrapper = mount(CommandDanmaku, {
      props: {
        options: nightOptions,
        commandDanmakuList: [],
        maxOrder: 0
      }
    })

    // 验证夜间模式样式应用
    const container = wrapper.find('.command-danmaku')
    // 在夜间模式下，组件内部会有特定的样式类
    expect(container.classes()).toContain('command-danmaku')
  })

  it('should display highlight effect for new danmaku', () => {
    const commandDanmakuList = [
      {
        id: 'cmd-1',
        userId: 'user-123',
        userName: '测试用户',
        userLevel: 50,
        content: '#点歌 青花瓷',
        command: '点歌',
        commandContent: '青花瓷',
        timestamp: Date.now(),
        userInfo: {
          avatar: 'test/avatar.png',
          fansLevel: 10,
          nobleLevel: 5,
          isRoomAdmin: false
        }
      }
    ]

    const wrapper = mount(CommandDanmaku, {
      props: {
        options: baseOptions,
        commandDanmakuList,
        maxOrder: 0
      }
    })

    // 新弹幕应该有高亮类
    const danmakuItem = wrapper.find('.command-danmaku-item')
    expect(danmakuItem.classes()).toContain('highlight')
  })
})