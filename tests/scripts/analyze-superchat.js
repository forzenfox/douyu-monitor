const fs = require('fs');
const path = require('path');

/**
 * 解析超级弹幕数据文件
 * @param {string} filePath - 数据文件路径
 * @returns {Array} 解析后的超级弹幕数据数组
 */
function parseSuperchatData(filePath) {
  try {
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // 按换行分割数据
    const lines = fileContent.trim().split('\n');

    // 解析每一行数据
    return lines
      .map(line => {
        try {
          // 解析URL编码格式的数据
          const chatmsgMatch = line.match(/chatmsg@=([^/]+)/);
          if (!chatmsgMatch) {
            return null;
          }

          const chatmsg = chatmsgMatch[1];

          // 解析公共字段
          const cpriceMatch = line.match(/cprice@=(\d+)/);
          const crealPriceMatch = line.match(/crealPrice@=(\d+)/);
          const nowMatch = line.match(/now@=(\d+)/);
          const vridMatch = line.match(/vrid@=(\d+)/);

          // 解析chatmsg内部字段
          const parseChatmsg = msgStr => {
            const result = {};
            // 处理@S分隔的字段
            const fields = msgStr.replace(/@S/g, '&').split('&');

            fields.forEach(field => {
              if (!field) return;

              // 处理@A分隔的键值对
              const [key, value] = field.split('@A');
              if (key && value !== undefined) {
                result[key] = value;
              }
            });

            return result;
          };

          const chatmsgData = parseChatmsg(chatmsg);

          // 计算价格
          const price =
            parseInt(crealPriceMatch?.[1] || cpriceMatch?.[1] || '0') / 100;

          // 生成超级弹幕数据格式
          return {
            nn: chatmsgData.nn || '匿名用户',
            avatar: chatmsgData.ic || '',
            txt: chatmsgData.txt || '暂无内容',
            price: price, // 转换为元
            rawCprice: cpriceMatch?.[1] || '0',
            rawCrealPrice: crealPriceMatch?.[1] || '0',
            vrid: vridMatch?.[1] || '',
            now: nowMatch?.[1] || Date.now().toString(),
            chatmsgData: chatmsgData,
          };
        } catch (error) {
          console.error('解析单条弹幕失败:', error, '原始数据:', line);
          return null;
        }
      })
      .filter(item => item !== null);
  } catch (error) {
    console.error('读取或解析文件失败:', error);
    return [];
  }
}

/**
 * 根据价格获取等级
 * @param {number} price - 价格（元）
 * @returns {number} 等级
 */
function getLevelByPrice(price) {
  if (price >= 1000) return 6;
  if (price >= 500) return 5;
  if (price >= 100) return 4;
  if (price >= 50) return 3;
  if (price >= 10) return 2;
  return 1;
}

/**
 * 分析超级弹幕数据
 * @param {Array} data - 超级弹幕数据数组
 */
function analyzeSuperchatData(data) {
  console.log(`共分析 ${data.length} 条超级弹幕数据`);

  // 统计价格分布
  const priceStats = {};
  const levelStats = {};

  data.forEach(item => {
    // 统计价格区间
    const priceRange = Math.floor(item.price / 100) * 100;
    priceStats[priceRange] = (priceStats[priceRange] || 0) + 1;

    // 统计等级分布
    const level = getLevelByPrice(item.price);
    levelStats[level] = (levelStats[level] || 0) + 1;

    // 检查异常数据
    if (item.price === 0) {
      console.error(`发现价格为0的超级弹幕:`, item);
    }

    if (!item.txt || item.txt.trim() === '') {
      console.error(`发现内容为空的超级弹幕:`, item);
    }
  });

  // 打印价格分布
  console.log('\n价格分布统计:');
  Object.entries(priceStats)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([range, count]) => {
      console.log(`  ${range}-${parseInt(range) + 99}元: ${count}条`);
    });

  // 打印等级分布
  console.log('\n等级分布统计:');
  Object.entries(levelStats)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([level, count]) => {
      console.log(`  等级${level}: ${count}条`);
    });

  // 计算平均价格
  const totalPrice = data.reduce((sum, item) => sum + item.price, 0);
  const avgPrice = totalPrice / data.length;
  console.log(`\n平均价格: ¥${avgPrice.toFixed(2)}`);

  // 找出最高和最低价格
  const maxPrice = Math.max(...data.map(item => item.price));
  const minPrice = Math.min(...data.map(item => item.price));
  console.log(`最高价格: ¥${maxPrice}`);
  console.log(`最低价格: ¥${minPrice}`);

  return {
    totalCount: data.length,
    avgPrice,
    maxPrice,
    minPrice,
    priceStats,
    levelStats,
  };
}

/**
 * 测试当前超级弹幕逻辑
 * @param {Array} data - 超级弹幕数据数组
 */
function testCurrentLogic(data) {
  console.log('\n=== 测试当前超级弹幕逻辑 ===');

  // 模拟当前代码中的问题
  const issues = [];

  data.forEach((item, index) => {
    // 测试1: 价格转换问题
    const price1 = parseInt(item.rawCprice) / 100;
    const price2 = parseInt(item.rawCrealPrice) / 100;
    if (price1 !== price2) {
      issues.push({
        type: '价格不一致',
        index: index + 1,
        vrid: item.vrid,
        cprice: price1,
        crealPrice: price2,
        message: `cprice(${price1}) 与 crealPrice(${price2}) 不一致`,
      });
    }

    // 测试2: 等级计算问题
    const level = getLevelByPrice(item.price);
    if (item.price >= 30 && item.price < 50 && level !== 2) {
      issues.push({
        type: '等级计算错误',
        index: index + 1,
        vrid: item.vrid,
        price: item.price,
        level: level,
        expectedLevel: 2,
        message: `价格${item.price}元应该对应等级2，但实际计算为等级${level}`,
      });
    }

    // 测试3: 空内容问题
    if (!item.txt || item.txt.trim() === '') {
      issues.push({
        type: '内容为空',
        index: index + 1,
        vrid: item.vrid,
        message: '超级弹幕内容为空',
      });
    }
  });

  // 打印问题
  if (issues.length > 0) {
    console.log(`发现 ${issues.length} 个问题:`);
    issues.forEach(issue => {
      console.error(`\n问题 ${issue.index} [${issue.type}]`);
      console.error(`  VRID: ${issue.vrid}`);
      if (issue.price !== undefined) {
        console.error(`  价格: ¥${issue.price}`);
      }
      if (issue.level !== undefined) {
        console.error(`  计算等级: ${issue.level}`);
        console.error(`  期望等级: ${issue.expectedLevel}`);
      }
      console.error(`  问题描述: ${issue.message}`);
    });
  } else {
    console.log('未发现明显问题');
  }

  return issues;
}

/**
 * 运行分析
 */
function runAnalysis() {
  const filePath = path.join(__dirname, '../data/superChatTestData.txt');
  console.log('开始分析超级弹幕数据...');

  // 解析数据
  const superchatData = parseSuperchatData(filePath);

  if (superchatData.length === 0) {
    console.error('解析失败，没有获取到有效数据');
    return;
  }

  // 分析数据
  const analysisResult = analyzeSuperchatData(superchatData);

  // 测试当前逻辑
  const issues = testCurrentLogic(superchatData);

  console.log('\n=== 分析总结 ===');
  console.log(`共解析 ${analysisResult.totalCount} 条超级弹幕`);
  console.log(`发现 ${issues.length} 个潜在问题`);
  console.log('建议修复方向:');
  console.log('1. 确保使用真实价格(crealPrice)而非虚拟价格(cprice)');
  console.log('2. 检查等级计算逻辑，确保30-50元区间对应等级2');
  console.log('3. 处理空内容超级弹幕');
  console.log('4. 优化背景颜色动态生成逻辑');
  console.log('5. 修复语音弹幕的用户信息解析');

  return {
    analysis: analysisResult,
    issues: issues,
    data: superchatData,
  };
}

// 运行分析
const result = runAnalysis();

// 导出结果
module.exports = {
  parseSuperchatData,
  analyzeSuperchatData,
  testCurrentLogic,
  runAnalysis,
};

if (require.main === module) {
  runAnalysis();
}
