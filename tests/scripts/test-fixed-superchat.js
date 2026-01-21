const fs = require('fs');
const path = require('path');

/**
 * 清理字段值，移除可能的前缀等异常字符
 * @param {string} value - 字段值
 * @returns {string} 清理后的字段值
 */
function cleanFieldValue(value) {
  if (!value) return '';
  // 移除可能的前缀"="和换行符
  return String(value)
    .replace(/^=+/, '')
    .replace(/[\r\n]/g, '')
    .trim();
}

/**
 * 根据价格获取超级弹幕背景颜色
 * @param {number} price - 超级弹幕价格
 * @returns {Object} 背景颜色对象 { header: 头部颜色, body: 身体颜色 }
 */
function getSuperchatBgColor(price) {
  if (price >= 1000) {
    return { header: 'rgb(208,0,0)', body: 'rgb(230,33,23)' };
  } else if (price >= 500) {
    return { header: 'rgb(194,24,91)', body: 'rgb(233,30,99)' };
  } else if (price >= 100) {
    return { header: 'rgb(230,81,0)', body: 'rgb(245,124,0)' };
  } else if (price >= 50) {
    return { header: 'rgb(0,191,165)', body: 'rgb(29,233,182)' };
  } else if (price >= 10) {
    return { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' };
  } else {
    return { header: 'rgb(103,58,183)', body: 'rgb(121,85,170)' };
  }
}

/**
 * 生成超级弹幕
 * @param {Object} data - 消息数据
 * @param {number} price - 超级弹幕价格
 * @returns {Object} 超级弹幕对象
 */
function generateSuperchat(data, price) {
  // 确保价格为有效数字，最低为0
  const validPrice = Math.max(0, parseFloat(price) || 0);

  // 从多种可能的字段中获取用户信息，确保兼容不同消息类型
  // 特别处理voiceDanmu类型，从chatmsg对象中提取真实的用户信息和弹幕内容
  const chatmsg = data.chatmsg || {};
  const nickname = cleanFieldValue(
    chatmsg.nn ||
      data.nn ||
      data.nick ||
      data.userName ||
      data.unk ||
      '匿名用户'
  );
  const avatar = cleanFieldValue(
    chatmsg.ic ||
      data.ic ||
      data.icon ||
      data.uic ||
      data.avatar ||
      data.userAvatar ||
      ''
  );
  const content = cleanFieldValue(
    chatmsg.txt || data.txt || data.msg || data.content || ''
  );

  // 根据价格确定超级弹幕等级
  let level = 1;
  if (validPrice >= 0) {
    // 根据价格区间确定等级
    if (validPrice >= 1000) level = 6;
    else if (validPrice >= 500) level = 5;
    else if (validPrice >= 100) level = 4;
    else if (validPrice >= 50) level = 3;
    else if (validPrice >= 30) level = 2;
    else level = 1;
  } else {
    // 负数价格使用最低等级
    level = 1;
  }

  // 动态生成背景颜色
  const bgColor = getSuperchatBgColor(validPrice);

  return {
    nn: nickname, // 昵称，确保有默认值
    avatar: avatar, // 头像地址，确保有默认值
    txt: content, // 弹幕内容，确保有默认值
    price: validPrice, // 使用有效价格
    level: level, // 等级
    bgColor: bgColor, // 动态生成背景颜色
    textColor: '#FFFFFF', // 默认文字颜色为白色
    nicknameColor: '#FFFFFF', // 默认昵称颜色为白色
    key: data.cid || new Date().getTime() + Math.random(), // 唯一标识
    createdAt: Date.now(), // 创建时间
    isExpired: false,
  };
}

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

          // 基于真实价格计算，优先使用crealPrice，否则使用cprice
          const cprice = parseInt(cpriceMatch?.[1] || '0');
          const crealPrice = parseInt(crealPriceMatch?.[1] || '0');
          const price =
            crealPrice > 0 ? crealPrice / 100 : cprice > 0 ? cprice / 100 : 10;

          // 生成超级弹幕数据格式
          return generateSuperchat(
            {
              chatmsg: chatmsgData,
              cprice: cprice,
              crealPrice: crealPrice,
              now: nowMatch?.[1],
              vrid: vridMatch?.[1],
            },
            price
          );
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
 * 测试修复后的超级弹幕逻辑
 */
function testFixedSuperchatLogic() {
  const filePath = path.join(__dirname, '../data/superChatTestData.txt');
  console.log('开始测试修复后的超级弹幕逻辑...');

  const superchatList = parseSuperchatData(filePath);
  console.log(`解析完成，共解析 ${superchatList.length} 条超级弹幕数据`);

  if (superchatList.length === 0) {
    console.error('测试失败，没有获取到有效数据');
    return { success: false };
  }

  // 验证修复效果
  let hasZeroPrice = false;
  let hasInvalidNickname = false;
  let hasInvalidContent = false;

  superchatList.forEach((item, index) => {
    // 检查价格是否有效
    if (item.price === 0) {
      hasZeroPrice = true;
      console.error(`第 ${index + 1} 条弹幕价格为0:`, item);
    }

    // 检查昵称是否有效
    if (!item.nn || item.nn === '匿名用户' || item.nn.startsWith('=')) {
      hasInvalidNickname = true;
      console.error(`第 ${index + 1} 条弹幕昵称无效:`, item.nn);
    }

    // 检查内容是否有效
    if (!item.txt || item.txt.trim() === '' || item.txt.startsWith('=')) {
      hasInvalidContent = true;
      console.error(`第 ${index + 1} 条弹幕内容无效:`, item.txt);
    }

    // 检查等级和价格是否匹配
    let expectedLevel = 1;
    if (item.price >= 1000) expectedLevel = 6;
    else if (item.price >= 500) expectedLevel = 5;
    else if (item.price >= 100) expectedLevel = 4;
    else if (item.price >= 50) expectedLevel = 3;
    else if (item.price >= 30) expectedLevel = 2;

    if (item.level !== expectedLevel) {
      console.error(
        `第 ${index + 1} 条弹幕等级不匹配: 价格${item.price}元，实际等级${item.level}，期望等级${expectedLevel}`
      );
    }
  });

  // 打印测试结果
  console.log('\n=== 测试结果 ===');
  console.log(`共测试 ${superchatList.length} 条超级弹幕`);
  console.log(`价格为0的弹幕: ${hasZeroPrice ? '有' : '无'}`);
  console.log(`无效昵称: ${hasInvalidNickname ? '有' : '无'}`);
  console.log(`无效内容: ${hasInvalidContent ? '有' : '无'}`);

  // 打印修复前后对比
  console.log('\n=== 修复前后对比 ===');
  console.log('修复前问题:');
  console.log('1. 字段值前有"="符号');
  console.log('2. 价格计算错误');
  console.log('3. 背景颜色固定不变');
  console.log('4. 内容包含换行符');
  console.log('\n修复后效果:');
  console.log('1. 自动清理字段值前缀和换行符');
  console.log('2. 使用真实价格(crealPrice)计算');
  console.log('3. 根据价格动态生成背景颜色');
  console.log('4. 内容自动去除换行符');

  // 打印统计信息
  const totalPrice = superchatList.reduce((sum, item) => sum + item.price, 0);
  const avgPrice = totalPrice / superchatList.length;
  const maxPrice = Math.max(...superchatList.map(item => item.price));
  const minPrice = Math.min(...superchatList.map(item => item.price));

  console.log('\n=== 统计信息 ===');
  console.log(`平均价格: ¥${avgPrice.toFixed(2)}`);
  console.log(`最高价格: ¥${maxPrice}`);
  console.log(`最低价格: ¥${minPrice}`);

  // 统计等级分布
  const levelStats = {};
  superchatList.forEach(item => {
    levelStats[item.level] = (levelStats[item.level] || 0) + 1;
  });

  console.log('\n等级分布:');
  Object.entries(levelStats)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([level, count]) => {
      console.log(`  等级${level}: ${count}条`);
    });

  const success = !hasZeroPrice && !hasInvalidNickname && !hasInvalidContent;
  console.log('\n=== 修复验证 ===');
  if (success) {
    console.log('✅ 修复成功！所有超级弹幕数据解析正常');
  } else {
    console.log('❌ 修复不完全，仍存在部分问题');
  }

  return {
    success,
    totalCount: superchatList.length,
    avgPrice,
    maxPrice,
    minPrice,
    levelStats,
  };
}

// 运行测试
const result = testFixedSuperchatLogic();

if (result.success) {
  process.exit(0);
} else {
  process.exit(1);
}
