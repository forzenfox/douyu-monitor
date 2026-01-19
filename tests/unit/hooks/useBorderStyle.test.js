import { describe, it, expect } from 'vitest'
import { useBorderStyle } from '../../../src/monitor/hooks/useBorderStyle'
import { ref } from 'vue'

describe('useBorderStyle', () => {
  it('should calculate correct border styles for day mode', () => {
    // 创建测试props
    const props = {
      options: {
        mode: 'day',
        direction: 'row',
        transparent: false,
        order: {
          danmaku: 1,
          gift: 2,
          enter: 3,
          superchat: 4
        }
      },
      maxOrder: 4
    }
    
    // 调用钩子函数
    const { borderBottomStyle, borderRightStyle } = useBorderStyle(props, 'superchat')
    
    // 验证计算结果
    expect(borderBottomStyle.value).toBe('0px solid rgb(227, 227, 227)')
    expect(borderRightStyle.value).toBe('0px solid rgb(227, 227, 227)') // maxOrder等于当前order
  })
  
  it('should calculate correct border styles for night mode', () => {
    // 创建测试props
    const props = {
      options: {
        mode: 'night',
        direction: 'column',
        transparent: false,
        order: {
          danmaku: 1,
          gift: 2,
          enter: 3,
          superchat: 4
        }
      },
      maxOrder: 4
    }
    
    // 调用钩子函数
    const { borderBottomStyle, borderRightStyle } = useBorderStyle(props, 'gift')
    
    // 验证计算结果
    expect(borderBottomStyle.value).toBe('3px solid rgb(81, 81, 81)') // 不是maxOrder
    expect(borderRightStyle.value).toBe('0px solid rgb(81, 81, 81)')
  })
  
  it('should handle transparent mode', () => {
    // 创建测试props
    const props = {
      options: {
        mode: 'day',
        direction: 'row',
        transparent: true,
        order: {
          danmaku: 1
        }
      },
      maxOrder: 1
    }
    
    // 调用钩子函数
    const { borderBottomStyle, borderRightStyle } = useBorderStyle(props, 'danmaku')
    
    // 验证透明模式下的样式
    expect(borderBottomStyle.value).toBe('0px solid rgba(255,255,255, 0)')
    expect(borderRightStyle.value).toBe('0px solid rgba(255,255,255, 0)')
  })
})
