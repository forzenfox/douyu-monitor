import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  fetchRoomGiftList, 
  fetchGiftCommonConfig, 
  fetchSingleGiftDetail, 
  fetchRoomGiftData, 
  fetchBackupGiftData 
} from '../../../src/global/utils/dydata/giftApi.js';

describe('礼物API模块测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 模拟 fetch API
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  describe('fetchRoomGiftList 函数', () => {
    it('应该在 rid 为空时抛出错误', async () => {
      await expect(fetchRoomGiftList('')).rejects.toThrow('房间ID不能为空');
      await expect(fetchRoomGiftList(null)).rejects.toThrow('房间ID不能为空');
      await expect(fetchRoomGiftList(undefined)).rejects.toThrow('房间ID不能为空');
    });

    it('应该成功获取房间礼物列表', async () => {
      const mockData = { code: 0, data: { list: [] } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      const result = await fetchRoomGiftList('123456');
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://gift.douyucdn.cn/api/gift/v5/web/list?rid=123456',
        expect.any(Object)
      );
    });

    it('应该在 HTTP 请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchRoomGiftList('123456')).rejects.toThrow('HTTP 404: Not Found');
    });

    it('应该在网络错误时抛出错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchRoomGiftList('123456')).rejects.toThrow('Network Error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchGiftCommonConfig 函数', () => {
    it('应该成功获取礼物公共配置', async () => {
      const mockData = { code: 0, data: { config: {} } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      const result = await fetchGiftCommonConfig();
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://gift.douyucdn.cn/api/gift/v1/web/commonConfig?',
        expect.any(Object)
      );
    });

    it('应该在 HTTP 请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGiftCommonConfig()).rejects.toThrow('HTTP 500: Internal Server Error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('应该在网络错误时抛出错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchGiftCommonConfig()).rejects.toThrow('Network Error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchSingleGiftDetail 函数', () => {
    it('应该在 gid 为空时抛出错误', async () => {
      await expect(fetchSingleGiftDetail('')).rejects.toThrow('礼物ID不能为空');
      await expect(fetchSingleGiftDetail(null)).rejects.toThrow('礼物ID不能为空');
      await expect(fetchSingleGiftDetail(undefined)).rejects.toThrow('礼物ID不能为空');
    });

    it('应该成功获取单个礼物详情', async () => {
      const mockData = { code: 0, data: { gift: {} } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      const result = await fetchSingleGiftDetail('123');
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://gift.douyucdn.cn/api/gift/v5/web/single?gid=123&skinId=0',
        expect.any(Object)
      );
    });

    it('应该使用提供的 skinId', async () => {
      const mockData = { code: 0, data: { gift: {} } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      await fetchSingleGiftDetail('123', '456');
      expect(fetch).toHaveBeenCalledWith(
        'https://gift.douyucdn.cn/api/gift/v5/web/single?gid=123&skinId=456',
        expect.any(Object)
      );
    });

    it('应该在 HTTP 请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchSingleGiftDetail('123')).rejects.toThrow('HTTP 404: Not Found');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchRoomGiftData 函数', () => {
    it('应该在 rid 为空时抛出错误', async () => {
      await expect(fetchRoomGiftData('')).rejects.toThrow('房间ID不能为空');
      await expect(fetchRoomGiftData(null)).rejects.toThrow('房间ID不能为空');
      await expect(fetchRoomGiftData(undefined)).rejects.toThrow('房间ID不能为空');
    });

    it('应该成功获取直播间礼物数据', async () => {
      const mockData = { code: 0, data: { giftData: {} } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      const result = await fetchRoomGiftData('123456');
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://www.douyu.com/japi/livebiznc/app/giftnote/data?rid=123456',
        expect.any(Object)
      );
    });

    it('应该在 HTTP 请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchRoomGiftData('123456')).rejects.toThrow('HTTP 500: Internal Server Error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchBackupGiftData 函数', () => {
    it('应该成功获取备用礼物数据（JSONP格式）', async () => {
      const mockJsonpData = 'jsonpCallback({"code":0,"data":{"giftList":[]}})';
      const mockParsedData = { code: 0, data: { giftList: [] } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(mockJsonpData)
      });

      const result = await fetchBackupGiftData();
      expect(result).toEqual(mockParsedData);
      expect(fetch).toHaveBeenCalledWith(
        'http://webconf.douyucdn.cn/resource/common/prop_gift_list/prop_gift_config.json',
        expect.any(Object)
      );
    });

    it('应该在 HTTP 请求失败时抛出错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchBackupGiftData()).rejects.toThrow('HTTP 404: Not Found');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('应该在 JSONP 解析失败时抛出错误', async () => {
      const invalidJsonpData = 'invalidJsonpData';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(invalidJsonpData)
      });
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchBackupGiftData()).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('应该在 JSON 解析失败时抛出错误', async () => {
      const invalidJsonJsonpData = 'jsonpCallback({invalid json})';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValueOnce(invalidJsonJsonpData)
      });
      
      // 模拟 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(fetchBackupGiftData()).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});
