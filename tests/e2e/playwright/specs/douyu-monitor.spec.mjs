import { chromium } from 'playwright';

/**
 * 斗鱼监控网页功能测试脚本
 * 功能：使用Playwright测试网页的基本功能
 */
async function testDouyuMonitor() {
  console.log('=== 斗鱼监控网页功能测试 ===\n');
  
  // 启动浏览器
  const browser = await chromium.launch({
    headless: true, // 使用无头模式，避免弹窗
    slowMo: 100
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 导航到测试页面
  const url = 'http://localhost:5173/douyu-monitor/';
  console.log(`导航到: ${url}`);
  
  try {
    // 导航到页面
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    console.log('页面加载成功');
    
    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');
    
    // 测试1: 验证页面标题
    const title = await page.title();
    console.log(`\n1. 页面标题: ${title}`);
    
    // 测试2: 验证基本结构
    console.log('\n2. 基本结构验证:');
    
    // 检查是否存在输入框
    const inputExists = await page.$('input') !== null;
    console.log(`   输入框存在: ${inputExists ? '✅' : '❌'}`);
    
    // 检查是否存在按钮
    const buttonExists = await page.$('button') !== null;
    console.log(`   按钮存在: ${buttonExists ? '✅' : '❌'}`);
    
    // 检查是否存在礼物相关组件
    const giftComponentExists = await page.$('[class*="gift"]') !== null;
    console.log(`   礼物组件存在: ${giftComponentExists ? '✅' : '❌'}`);
    
    // 检查是否存在弹幕相关组件
    const danmakuComponentExists = await page.$('[class*="danmaku"]') !== null;
    console.log(`   弹幕组件存在: ${danmakuComponentExists ? '✅' : '❌'}`);
    
    // 测试3: 测试输入功能
    console.log('\n3. 输入功能测试:');
    
    // 查找房间号输入框
    const roomInput = await page.$('input[placeholder*="房间号"]') || await page.$('input[type="text"]');
    if (roomInput) {
      await roomInput.fill('317422');
      console.log('   成功输入房间号: 317422');
      
      // 查找开始按钮
      const startButton = await page.$('button:has-text("开始")') || await page.$('button[type="button"]');
      if (startButton) {
        await startButton.click();
        console.log('   成功点击开始按钮');
        
        // 等待几秒钟，观察是否有礼物数据加载
        await page.waitForTimeout(3000);
        
        // 检查是否有礼物数据显示
        const giftItems = await page.$$('[class*="item"]');
        console.log(`   检测到 ${giftItems.length} 个礼物/弹幕项`);
      }
    }
    
    // 测试4: 截图
    console.log('\n4. 页面截图:');
    await page.screenshot({
      path: 'douyu_monitor_screenshot.png',
      fullPage: true
    });
    console.log('   截图已保存: douyu_monitor_screenshot.png');
    
    // 测试5: 验证网络请求
    console.log('\n5. 网络请求验证:');
    
    // 记录礼物相关请求
    const giftRequests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('gift') || url.includes('prop') || url.includes('present')) {
        giftRequests.push(url);
      }
    });
    
    // 等待几秒钟，收集网络请求
    await page.waitForTimeout(5000);
    
    console.log(`   检测到 ${giftRequests.length} 个礼物相关请求`);
    if (giftRequests.length > 0) {
      console.log('   部分礼物请求:');
      giftRequests.slice(0, 3).forEach(req => {
        console.log(`     - ${req}`);
      });
    }
    
    console.log('\n=== 测试完成 ===');
    console.log('✅ 所有测试项目已完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    // 关闭浏览器
    await browser.close();
    console.log('\n浏览器已关闭');
  }
}

// 执行测试
testDouyuMonitor();
