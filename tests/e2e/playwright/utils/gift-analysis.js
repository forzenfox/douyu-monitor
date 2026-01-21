import { chromium } from 'playwright';

/**
 * 斗鱼直播礼物获取逻辑分析脚本
 * 功能：监控斗鱼直播间网络请求，分析礼物获取逻辑
 */
async function analyzeDouyuGifts() {
  console.log('=== 斗鱼直播礼物获取逻辑分析 ===\n');

  // 启动浏览器
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // 收集礼物相关API请求
  const giftRequests = [];

  // 监控网络请求
  page.on('request', request => {
    const url = request.url();
    const method = request.method();

    // 过滤礼物相关请求
    if (
      url.includes('gift') ||
      url.includes('present') ||
      url.includes('prop') ||
      url.includes('bag') ||
      url.includes('wealth') ||
      url.includes('treasure')
    ) {
      giftRequests.push({
        id: giftRequests.length + 1,
        url: url,
        method: method,
        timestamp: new Date().toISOString(),
        requestType: 'request',
      });
      console.log(`[${method}] 礼物相关请求: ${url}`);
    }
  });

  // 监控网络响应
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();

    // 过滤礼物相关响应
    if (
      url.includes('gift') ||
      url.includes('present') ||
      url.includes('prop') ||
      url.includes('bag') ||
      url.includes('wealth') ||
      url.includes('treasure')
    ) {
      try {
        const responseBody = await response.text();
        let parsedBody = null;

        // 尝试解析JSON
        try {
          parsedBody = JSON.parse(responseBody);
        } catch (e) {
          // 非JSON响应
        }

        console.log(`\n[${status}] 礼物相关响应: ${url}`);
        console.log(`  响应大小: ${responseBody.length} 字符`);

        if (parsedBody) {
          console.log('  响应结构:');
          console.log('    包含的键:', Object.keys(parsedBody).join(', '));

          // 如果有礼物列表或数据，显示部分信息
          if (parsedBody.data && typeof parsedBody.data === 'object') {
            console.log('    Data键:', Object.keys(parsedBody.data).join(', '));
          }

          if (
            parsedBody.gift ||
            parsedBody.gifts ||
            parsedBody.prop ||
            parsedBody.props
          ) {
            console.log('    包含礼物数据字段');
          }
        } else {
          console.log('  响应类型: 非JSON');
        }
      } catch (error) {
        console.log(`\n[${status}] 礼物相关响应: ${url}`);
        console.log('  解析响应失败:', error.message);
      }
    }
  });

  try {
    // 导航到直播间
    console.log('\n正在导航到斗鱼直播间: https://www.douyu.com/317422');
    await page.goto('https://www.douyu.com/317422', {
      waitUntil: 'load',
      timeout: 60000,
    });

    console.log('\n页面加载完成，开始监控网络请求...');
    console.log('等待5秒钟以收集网络请求...');

    // 等待5秒钟，收集网络请求
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 尝试点击礼物按钮，触发礼物数据加载
    console.log('\n尝试点击礼物按钮，触发礼物数据加载...');

    // 查找礼物按钮并点击
    const giftButtons = await page.$$(
      '[class*="gift"], [id*="gift"], [class*="present"], [id*="present"]'
    );
    if (giftButtons.length > 0) {
      console.log(
        `找到 ${giftButtons.length} 个礼物相关按钮，尝试点击第一个...`
      );
      try {
        await giftButtons[0].click({ timeout: 5000 });
        console.log('礼物按钮点击成功');

        // 等待3秒，收集点击后的请求
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.log('点击礼物按钮失败:', error.message);
      }
    }

    console.log('\n=== 监控结束 ===');
    console.log(`共捕获 ${giftRequests.length} 个礼物相关请求`);

    if (giftRequests.length > 0) {
      console.log('\n礼物相关请求列表:');
      giftRequests.forEach(req => {
        console.log(`${req.id}. [${req.method}] ${req.url}`);
      });
    }
  } catch (error) {
    console.error('分析过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    // 关闭浏览器
    await browser.close();
  }
}

// 执行分析
analyzeDouyuGifts();
