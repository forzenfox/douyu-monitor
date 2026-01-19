import { describe, it, expect } from 'vitest'
import { parseSuperchatData, getLevelByPrice, getHeaderColor, getBodyColor } from '../../scripts/test-superchat'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Superchat Data Parsing', () => {
  // 测试数据文件路径
  const testDataPath = resolve(__dirname, '../../data/superChatTestData.txt')
  
  it('should parse superchat data file correctly', () => {
    const result = parseSuperchatData(testDataPath)
    
    // 验证解析结果
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    
    // 验证每条数据的格式
    result.forEach(item => {
      expect(item).toHaveProperty('nn')
      expect(item).toHaveProperty('avatar')
      expect(item).toHaveProperty('txt')
      expect(item).toHaveProperty('price')
      expect(item).toHaveProperty('level')
      expect(item).toHaveProperty('bgColor')
      expect(item).toHaveProperty('textColor')
      expect(item).toHaveProperty('nicknameColor')
      expect(item).toHaveProperty('key')
      expect(item).toHaveProperty('createdAt')
      expect(item).toHaveProperty('isExpired')
      
      // 验证价格是数字
      expect(typeof item.price).toBe('number')
      expect(item.price).toBeGreaterThan(0)
      
      // 验证背景颜色对象
      expect(item.bgColor).toHaveProperty('header')
      expect(item.bgColor).toHaveProperty('body')
    })
  })
  
  it('should calculate correct level by price', () => {
    // 测试不同价格对应的等级
    expect(getLevelByPrice(5)).toBe(1)
    expect(getLevelByPrice(10)).toBe(2)
    expect(getLevelByPrice(30)).toBe(2)
    expect(getLevelByPrice(50)).toBe(3)
    expect(getLevelByPrice(100)).toBe(4)
    expect(getLevelByPrice(500)).toBe(5)
    expect(getLevelByPrice(1000)).toBe(6)
    expect(getLevelByPrice(2000)).toBe(6)
  })
  
  it('should return correct header color by price', () => {
    // 测试不同价格对应的头部颜色
    expect(getHeaderColor(5)).toBe('rgb(21,101,192)')
    expect(getHeaderColor(10)).toBe('rgb(0,191,165)')
    expect(getHeaderColor(30)).toBe('rgb(230,81,0)')
    expect(getHeaderColor(50)).toBe('rgb(194,24,91)')
    expect(getHeaderColor(100)).toBe('rgb(208,0,0)')
    expect(getHeaderColor(500)).toBe('rgb(208,0,0)')
  })
  
  it('should return correct body color by price', () => {
    // 测试不同价格对应的身体颜色
    expect(getBodyColor(5)).toBe('rgb(30,136,229)')
    expect(getBodyColor(10)).toBe('rgb(29,233,182)')
    expect(getBodyColor(30)).toBe('rgb(245,124,0)')
    expect(getBodyColor(50)).toBe('rgb(233,30,99)')
    expect(getBodyColor(100)).toBe('rgb(230,33,23)')
    expect(getBodyColor(500)).toBe('rgb(230,33,23)')
  })
  
  it('should handle invalid data gracefully', () => {
    // 测试空字符串
    expect(parseSuperchatData('')).toEqual([])
    
    // 测试不存在的文件
    expect(parseSuperchatData('non-existent-file.txt')).toEqual([])
  })
  
  it('should parse all 26 superchat messages from test file', () => {
    const result = parseSuperchatData(testDataPath)
    expect(result.length).toBe(26)
  })
  
  it('should assign correct average price to superchat messages', () => {
    const result = parseSuperchatData(testDataPath)
    const totalPrice = result.reduce((sum, item) => sum + item.price, 0)
    const avgPrice = totalPrice / result.length
    
    // 验证平均价格在合理范围内
    expect(avgPrice).toBeGreaterThan(20)
    expect(avgPrice).toBeLessThan(50)
  })
  
  it('should handle messages with missing fields', () => {
    // 创建一个模拟的不完整数据行，使用正确的格式
    const mockData = 'vrid@=1234567890/chatmsg@=nn@A=测试用户@Stxt@A=测试内容@Scprice@=1000@Snow@=1705678901234@Stype@=comm_chatmsg@Srid@=123456@Sgbtemp@=2@Suid@=12345@ScrealPrice@=1000@Scet@=60@Sdanmucr@=1@S/type@=comm_chatmsg/rid@=123456/cprice@=1000/now@=1705678901234/gbtemp@=2/uid@=12345/crealPrice@=1000/cet@=60/danmucr@=1/'
    
    // 写入临时文件
    const tempFilePath = resolve(__dirname, 'temp-superchat-test.txt')
    require('fs').writeFileSync(tempFilePath, mockData)
    
    const result = parseSuperchatData(tempFilePath)
    
    // 验证解析结果
    expect(result.length).toBe(1)
    expect(result[0].nn).toBe('=测试用户')
    expect(result[0].txt).toBe('=测试内容')
    expect(result[0].price).toBe(10)
    
    // 清理临时文件
    require('fs').unlinkSync(tempFilePath)
  })
})
