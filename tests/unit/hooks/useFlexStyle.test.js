import { describe, it, expect } from 'vitest'
import { useFlexStyle } from '../../../src/monitor/hooks/useFlexStyle'

describe('useFlexStyle', () => {
  it('should calculate correct flex styles when maxOrder matches current order', () => {
    // 创建测试props
    const props = {
      options: {
        align: 'left',
        order: {
          danmaku: 1,
          gift: 2,
          enter: 3,
          superchat: 4
        },
        size: {
          danmaku: 25,
          gift: 25,
          enter: 25,
          superchat: 25
        }
      },
      maxOrder: 4
    }
    
    // 调用钩子函数
    const { flexStyle, orderStyle, justifyContentStyle, textAlignStyle } = useFlexStyle(props, 'superchat')
    
    // 验证计算结果
    expect(flexStyle.value).toBe('1') // maxOrder等于当前order
    expect(orderStyle.value).toBe('4')
    expect(justifyContentStyle.value).toBe('flex-start')
    expect(textAlignStyle.value).toBe('left')
  })
  
  it('should calculate correct flex styles when maxOrder does not match current order', () => {
    // 创建测试props
    const props = {
      options: {
        align: 'right',
        order: {
          danmaku: 1,
          gift: 2
        },
        size: {
          danmaku: 50,
          gift: 50
        }
      },
      maxOrder: 2
    }
    
    // 调用钩子函数
    const { flexStyle, orderStyle, justifyContentStyle, textAlignStyle } = useFlexStyle(props, 'danmaku')
    
    // 验证计算结果
    expect(flexStyle.value).toBe('0 0 50%') // maxOrder不等于当前order
    expect(orderStyle.value).toBe('1')
    expect(justifyContentStyle.value).toBe('flex-end')
    expect(textAlignStyle.value).toBe('right')
  })
})
