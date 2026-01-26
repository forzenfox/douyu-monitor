/**
 * 斗鱼礼物API模块
 * 功能：封装礼物相关API请求，提供统一的接口
 */

/**
 * 获取直播间礼物列表
 * @param {string} rid - 房间ID
 * @returns {Promise<Object>} 礼物列表数据
 */
export async function fetchRoomGiftList(rid) {
  if (!rid) {
    throw new Error('房间ID不能为空');
  }

  try {
    const response = await fetch(
      `https://gift.douyucdn.cn/api/gift/v5/web/list?rid=${rid}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取房间礼物列表失败:', error.message);
    throw error;
  }
}

/**
 * 获取礼物公共配置
 * @returns {Promise<Object>} 公共配置数据
 */
export async function fetchGiftCommonConfig() {
  try {
    const response = await fetch(
      'https://gift.douyucdn.cn/api/gift/v1/web/commonConfig?',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取礼物公共配置失败:', error.message);
    throw error;
  }
}

/**
 * 获取单个礼物详情
 * @param {string} gid - 礼物ID
 * @param {string} skinId - 皮肤ID，默认为0
 * @returns {Promise<Object>} 单个礼物详情
 */
export async function fetchSingleGiftDetail(gid, skinId = '0') {
  if (!gid) {
    throw new Error('礼物ID不能为空');
  }

  try {
    const response = await fetch(
      `https://gift.douyucdn.cn/api/gift/v5/web/single?gid=${gid}&skinId=${skinId}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取单个礼物详情失败:', error.message);
    throw error;
  }
}

/**
 * 获取直播间礼物数据
 * @param {string} rid - 房间ID
 * @returns {Promise<Object>} 直播间礼物数据
 */
export async function fetchRoomGiftData(rid) {
  if (!rid) {
    throw new Error('房间ID不能为空');
  }

  try {
    const response = await fetch(
      `https://www.douyu.com/japi/livebiznc/app/giftnote/data?rid=${rid}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取直播间礼物数据失败:', error.message);
    throw error;
  }
}

/**
 * 获取原有备用礼物数据
 * @returns {Promise<Object>} 备用礼物数据
 */
export async function fetchBackupGiftData() {
  try {
    const response = await fetch(
      'http://webconf.douyucdn.cn/resource/common/prop_gift_list/prop_gift_config.json',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    // 处理JSONP响应
    const jsonStr = responseText.substring(
      responseText.indexOf('(') + 1,
      responseText.lastIndexOf(')')
    );
    const data = JSON.parse(jsonStr);
    return data;
  } catch (error) {
    console.error('获取备用礼物数据失败:', error.message);
    throw error;
  }
}
