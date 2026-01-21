#!/usr/bin/env node

/**
 * 斗鱼礼物数据生成脚本
 * 功能：在构建阶段自动从API获取最新礼物数据，生成静态文件
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.resolve(
  process.cwd(),
  'src/global/utils/dydata/giftData.generated.js'
);

const ROOM_ID = '317422'; // 默认直播间ID
const CACHE_FILE = path.resolve(process.cwd(), '.gift-data-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 缓存有效期（24小时）

/**
 * 获取礼物数据
 */
async function fetchGiftData() {
  console.log('=== 开始获取礼物数据 ===');

  // 检查缓存
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (Date.now() - cache.timestamp < CACHE_DURATION) {
        console.log('使用缓存数据');
        return cache.data;
      }
    } catch (e) {
      console.log('缓存文件损坏，重新获取');
    }
  }

  const apis = [
    {
      name: '礼物列表API',
      url: `https://gift.douyucdn.cn/api/gift/v5/web/list?rid=${ROOM_ID}`,
      required: true,
    },
    {
      name: '礼物公共配置API',
      url: 'https://gift.douyucdn.cn/api/gift/v1/web/commonConfig?',
      required: false,
    },
    {
      name: '原有备用数据源',
      url: 'http://webconf.douyucdn.cn/resource/common/prop_gift_list/prop_gift_config.json',
      required: false,
      isJsonp: true,
    },
  ];

  const results = [];

  for (const api of apis) {
    try {
      console.log(`获取 ${api.name}...`);
      const response = await fetch(api.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let data;
      const responseText = await response.text();

      if (api.isJsonp) {
        // 处理JSONP响应
        const jsonStr = responseText.substring(
          responseText.indexOf('(') + 1,
          responseText.lastIndexOf(')')
        );
        data = JSON.parse(jsonStr);
      } else {
        // 处理JSON响应
        data = JSON.parse(responseText);
      }

      results.push({ name: api.name, data });
      console.log(`✅ ${api.name} 获取成功`);
    } catch (error) {
      console.error(`❌ ${api.name} 获取失败:`, error.message);
      if (api.required) {
        throw error;
      }
    }
  }

  // 缓存数据
  const cacheData = {
    timestamp: Date.now(),
    data: results,
  };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));

  return results;
}

/**
 * 处理礼物数据
 */
function processGiftData(results) {
  console.log('\n=== 开始处理礼物数据 ===');

  // 合并数据
  const giftListApi = results.find(r => r.name === '礼物列表API');
  const commonConfigApi = results.find(r => r.name === '礼物公共配置API');
  const backupApi = results.find(r => r.name === '原有备用数据源');

  const giftData = {};
  const tabs = [];
  const commonConfig = {};

  // 处理主礼物数据
  if (giftListApi && giftListApi.data.data) {
    const {
      giftList,
      tabs: apiTabs,
      onceLimit,
      skinData,
    } = giftListApi.data.data;

    if (giftList && Array.isArray(giftList)) {
      giftList.forEach(gift => {
        // 跳过空礼物
        if (!gift || !gift.id) return;

        giftData[gift.id] = {
          id: gift.id,
          name: gift.name || gift.n || '',
          price: gift.price || gift.pc || 0,
          type: gift.type || 0,
          icon: gift.icon || gift.pic || '',
          onceLimit: onceLimit?.[gift.id] || 0,
          skinData: skinData?.[gift.id] || {},
        };
      });
    }

    if (apiTabs && Array.isArray(apiTabs)) {
      tabs.push(...apiTabs);
    }
  }

  // 处理公共配置
  if (commonConfigApi && commonConfigApi.data.data) {
    commonConfig.picUrlPrefix = commonConfigApi.data.data.picUrlPrefix || '';
    commonConfig.banners = commonConfigApi.data.data.banners || [];
    commonConfig.bannersNew = commonConfigApi.data.data.bannersNew || [];
    commonConfig.combos = commonConfigApi.data.data.combos || [];
  }

  // 处理备用数据源
  if (backupApi && backupApi.data.data && Object.keys(giftData).length === 0) {
    console.log('使用备用数据源');
    for (const key in backupApi.data.data) {
      const item = backupApi.data.data[key];
      giftData[key] = {
        id: key,
        name: item.name || '',
        price: item.pc || 0,
        type: 0,
        icon: item.himg || '',
        onceLimit: 0,
        skinData: {},
      };
    }
  }

  console.log(`✅ 处理完成，共生成 ${Object.keys(giftData).length} 个礼物数据`);

  return {
    giftData,
    tabs,
    commonConfig,
  };
}

/**
 * 生成静态文件
 */
function generateStaticFile(data) {
  console.log('\n=== 开始生成静态文件 ===');

  const { giftData, tabs, commonConfig } = data;

  const content = `/**
 * 斗鱼礼物数据（自动生成）
 * 更新时间: ${new Date().toISOString()}
 * 礼物数量: ${Object.keys(giftData).length}
 */

// 礼物数据结构：
// {
//   [giftId: string]: {
//     id: string;          // 礼物ID
//     name: string;        // 礼物名称
//     price: number;       // 礼物价格（单位：分）
//     type: number;        // 礼物类型
//     icon: string;        // 礼物图标URL
//     onceLimit: number;   // 单次送礼限制
//     skinData: Object;    // 皮肤数据
//   }
// }

export const giftData = ${JSON.stringify(giftData, null, 2)};

export const tabs = ${JSON.stringify(tabs, null, 2)};

export const commonConfig = ${JSON.stringify(commonConfig, null, 2)};

export const giftDataVersion = '${Date.now()}';
`;

  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  console.log(`✅ 静态文件生成成功: ${OUTPUT_FILE}`);
  console.log(`✅ 包含 ${Object.keys(giftData).length} 个礼物数据`);
}

/**
 * 主函数
 */
async function main() {
  try {
    // 1. 获取礼物数据
    const results = await fetchGiftData();

    // 2. 处理礼物数据
    const processedData = processGiftData(results);

    // 3. 生成静态文件
    generateStaticFile(processedData);

    console.log('\n=== 礼物数据生成完成 ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 礼物数据生成失败:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 执行主函数
main();
