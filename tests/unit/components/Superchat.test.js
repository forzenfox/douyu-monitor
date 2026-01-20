import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Superchat from '../../../src/monitor/components/Superchat/Superchat.vue'

describe('Superchat Component', () => {
  it('should render correctly with default props', () => {
    const options = {
      size: { superchat: 30 },
      mode: 'day',
      animation: true,
      superchat: {
        show: ['fans', 'noble', 'roomAdmin', 'diamond', 'time'],
        options: [
          { minPrice: 1000, time: 3600, bgColor: { header: 'rgb(208,0,0)', body: 'rgb(230,33,23)' } },
          { minPrice: 500, time: 1800, bgColor: { header: 'rgb(194,24,91)', body: 'rgb(233,30,99)' } },
          { minPrice: 100, time: 300, bgColor: { header: 'rgb(230,81,0)', body: 'rgb(245,124,0)' } },
          { minPrice: 50, time: 120, bgColor: { header: 'rgb(0,191,165)', body: 'rgb(29,233,182)' } },
          { minPrice: 30, time: 60, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } },
          { minPrice: 10, time: 30, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } }
        ]
      }
    }
    
    const superchatList = []
    const maxOrder = 0
    
    const wrapper = mount(Superchat, {
      props: {
        options,
        superchatList,
        maxOrder
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('superchat')
  })
  
  it('should render superchat items correctly', () => {
    const options = {
      size: { superchat: 30 },
      mode: 'day',
      animation: true,
      superchat: {
        show: ['fans', 'noble', 'roomAdmin', 'diamond', 'time'],
        options: [
          { minPrice: 1000, time: 3600, bgColor: { header: 'rgb(208,0,0)', body: 'rgb(230,33,23)' } },
          { minPrice: 10, time: 30, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } }
        ]
      }
    }
    
    const superchatList = [
      {
        nn: '测试用户',
        avatar: 'test/avatar.png',
        txt: '这是一条超级弹幕',
        price: 200,
        level: 4,
        bgColor: { header: 'rgb(230,81,0)', body: 'rgb(245,124,0)' },
        textColor: '#FFFFFF',
        nicknameColor: '#FFFFFF',
        key: 'test-key-1',
        createdAt: Date.now(),
        isExpired: false,
        fansName: '测试粉丝牌',
        fansLv: 10,
        noble: true,
        roomAdmin: true,
        diamond: true,
        time: Math.floor(Date.now() / 1000)
      },
      {
        nn: '过期用户',
        avatar: 'test/avatar.png',
        txt: '这是一条过期弹幕',
        price: 100,
        level: 3,
        bgColor: { header: 'rgb(0,191,165)', body: 'rgb(29,233,182)' },
        textColor: '#FFFFFF',
        nicknameColor: '#FFFFFF',
        key: 'test-key-2',
        createdAt: Date.now() - 3600 * 1000,
        isExpired: true
      }
    ]
    
    const maxOrder = 0
    
    const wrapper = mount(Superchat, {
      props: {
        options,
        superchatList,
        maxOrder
      }
    })
    
    // 验证超级弹幕项渲染
    const superchatItems = wrapper.findAll('.superchat-item')
    expect(superchatItems.length).toBe(2)
    
    // 验证第一个超级弹幕显示正常
    expect(superchatItems[0].find('.superchat-nickname').text()).toBe('测试用户')
    expect(superchatItems[0].find('.superchat-message').text()).toBe('这是一条超级弹幕')
    expect(superchatItems[0].find('.superchat-fans').text()).toBe('测试粉丝牌 Lv10')
    expect(superchatItems[0].find('.superchat-noble').text()).toBe('贵族')
    expect(superchatItems[0].find('.superchat-roomAdmin').text()).toBe('房管')
    expect(superchatItems[0].find('.superchat-diamond').text()).toBe('钻粉')
    expect(superchatItems[0].find('.superchat-time').exists()).toBe(true)
    
    // 验证第二个超级弹幕显示为过期状态
    expect(superchatItems[1].classes()).toContain('superchat-item--expired')
  })
  
  it('should handle empty superchat list', () => {
    const options = {
      size: { superchat: 30 },
      mode: 'day',
      animation: true,
      superchat: {
        show: ['fans', 'noble', 'roomAdmin', 'diamond', 'time'],
        options: [
          { minPrice: 10, time: 30, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } }
        ]
      }
    }
    
    const superchatList = []
    const maxOrder = 0
    
    const wrapper = mount(Superchat, {
      props: {
        options,
        superchatList,
        maxOrder
      }
    })
    
    // 验证没有渲染超级弹幕项
    expect(wrapper.findAll('.superchat-item').length).toBe(0)
  })
  
  it('should apply correct style based on price level', () => {
    const options = {
      size: { superchat: 30 },
      mode: 'day',
      animation: true,
      superchat: {
        show: ['fans', 'time'],
        options: [
          { minPrice: 1000, time: 3600, bgColor: { header: 'rgb(208,0,0)', body: 'rgb(230,33,23)' } },
          { minPrice: 500, time: 1800, bgColor: { header: 'rgb(194,24,91)', body: 'rgb(233,30,99)' } },
          { minPrice: 100, time: 300, bgColor: { header: 'rgb(230,81,0)', body: 'rgb(245,124,0)' } },
          { minPrice: 50, time: 120, bgColor: { header: 'rgb(0,191,165)', body: 'rgb(29,233,182)' } },
          { minPrice: 30, time: 60, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } },
          { minPrice: 10, time: 30, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } }
        ]
      }
    }
    
    const superchatList = [
      {
        nn: '高级用户',
        avatar: 'test/avatar.png',
        txt: '我是高级用户',
        price: 1500,
        level: 6,
        bgColor: { header: 'rgb(208,0,0)', body: 'rgb(230,33,23)' },
        textColor: '#FFFFFF',
        nicknameColor: '#FFFFFF',
        key: 'test-key-1',
        createdAt: Date.now(),
        isExpired: false,
        fansName: '高级粉丝牌',
        fansLv: 20,
        time: Math.floor(Date.now() / 1000)
      },
      {
        nn: '普通用户',
        avatar: 'test/avatar.png',
        txt: '我是普通用户',
        price: 50,
        level: 1,
        bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' },
        textColor: '#FFFFFF',
        nicknameColor: '#FFFFFF',
        key: 'test-key-2',
        createdAt: Date.now(),
        isExpired: false
      }
    ]
    
    const maxOrder = 0
    
    const wrapper = mount(Superchat, {
      props: {
        options,
        superchatList,
        maxOrder
      }
    })
    
    const superchatItems = wrapper.findAll('.superchat-item')
    expect(superchatItems.length).toBe(2)
    
    // 验证不同价格等级的超级弹幕有不同的样式
    const highLevelItem = superchatItems[0]
    const normalItem = superchatItems[1]
    
    expect(highLevelItem.classes()).toContain('superchat-level-6')
    expect(normalItem.classes()).toContain('superchat-level-1')
    
    // 验证背景颜色样式
    expect(highLevelItem.attributes('style')).toContain('rgb(230, 33, 23)')
    expect(normalItem.attributes('style')).toContain('rgb(30, 136, 229)')
    
    // 验证粉丝牌和时间显示
    expect(highLevelItem.find('.superchat-fans').text()).toBe('高级粉丝牌 Lv20')
    expect(highLevelItem.find('.superchat-time').exists()).toBe(true)
  })
  
  it('should render expired superchats with correct style', () => {
    const options = {
      size: { superchat: 30 },
      mode: 'day',
      animation: true,
      superchat: {
        show: ['fans', 'noble', 'roomAdmin', 'diamond', 'time'],
        options: [
          { minPrice: 10, time: 30, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } }
        ]
      }
    }
    
    const superchatList = [
      {
        nn: '过期用户',
        avatar: 'test/avatar.png',
        txt: '这是一条过期弹幕',
        price: 100,
        level: 3,
        bgColor: { header: 'rgb(0,191,165)', body: 'rgb(29,233,182)' },
        textColor: '#FFFFFF',
        nicknameColor: '#FFFFFF',
        key: 'test-key-2',
        createdAt: Date.now() - 3600 * 1000,
        isExpired: true
      }
    ]
    
    const maxOrder = 0
    
    const wrapper = mount(Superchat, {
      props: {
        options,
        superchatList,
        maxOrder
      }
    })
    
    const superchatItem = wrapper.find('.superchat-item')
    
    // 验证过期样式
    expect(superchatItem.classes()).toContain('superchat-item--expired')
    expect(superchatItem.attributes('style')).toContain('rgb(240, 240, 240)')
  })
  
  it('should show/hide elements based on configuration', () => {
    const options = {
      size: { superchat: 30 },
      mode: 'day',
      animation: true,
      superchat: {
        show: ['fans', 'time'], // 只显示粉丝牌和时间
        options: [
          { minPrice: 10, time: 30, bgColor: { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' } }
        ]
      }
    }
    
    const superchatList = [
      {
        nn: '测试用户',
        avatar: 'test/avatar.png',
        txt: '这是一条超级弹幕',
        price: 200,
        level: 4,
        bgColor: { header: 'rgb(230,81,0)', body: 'rgb(245,124,0)' },
        textColor: '#FFFFFF',
        nicknameColor: '#FFFFFF',
        key: 'test-key-1',
        createdAt: Date.now(),
        isExpired: false,
        fansName: '测试粉丝牌',
        fansLv: 10,
        noble: true,
        roomAdmin: true,
        diamond: true,
        time: Math.floor(Date.now() / 1000)
      }
    ]
    
    const maxOrder = 0
    
    const wrapper = mount(Superchat, {
      props: {
        options,
        superchatList,
        maxOrder
      }
    })
    
    const superchatItem = wrapper.find('.superchat-item')
    
    // 验证显示的元素
    expect(superchatItem.find('.superchat-fans').exists()).toBe(true)
    expect(superchatItem.find('.superchat-time').exists()).toBe(true)
    
    // 验证隐藏的元素
    expect(superchatItem.find('.superchat-noble').exists()).toBe(false)
    expect(superchatItem.find('.superchat-roomAdmin').exists()).toBe(false)
    expect(superchatItem.find('.superchat-diamond').exists()).toBe(false)
  })
})