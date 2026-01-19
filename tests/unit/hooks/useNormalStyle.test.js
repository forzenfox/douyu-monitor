import { describe, it, expect } from 'vitest'
import { useNormalStyle } from '../../../src/monitor/hooks/useNormalStyle'
import { ref } from 'vue'

describe('useNormalStyle', () => {
  it('should calculate correct styles based on options', () => {
    // 创建测试选项
    const options = ref({
      direction: 'row',
      fontSize: 16
    })
    
    // 调用钩子函数
    const { directionStyle, fontSizeStyle, avatarImgSizeStyle } = useNormalStyle(options)
    
    // 验证计算结果
    expect(directionStyle.value).toBe('row')
    expect(fontSizeStyle.value).toBe('16px')
    expect(avatarImgSizeStyle.value).toBe('32px') // 字体大小的2倍
  })
  
  it('should update styles when options change', () => {
    // 创建测试选项
    const options = ref({
      direction: 'row',
      fontSize: 16
    })
    
    // 调用钩子函数
    const { directionStyle, fontSizeStyle, avatarImgSizeStyle } = useNormalStyle(options)
    
    // 修改选项
    options.value = {
      direction: 'column',
      fontSize: 20
    }
    
    // 验证样式更新
    expect(directionStyle.value).toBe('column')
    expect(fontSizeStyle.value).toBe('20px')
    expect(avatarImgSizeStyle.value).toBe('40px') // 字体大小的2倍
  })
})
