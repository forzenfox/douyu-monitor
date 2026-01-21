/**
 * 页面结构分析工具
 * 功能：分析页面的DOM结构和CSS类名，帮助确定正确的元素定位方式
 */

import { chromium } from 'playwright';

async function analyzePageStructure() {
  console.log('=== 开始分析页面结构 ===\n');

  // 启动浏览器
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // 导航到测试页面，使用房间号参数
  const roomId = '317422';
  const url = `http://localhost:5173/?roomId=${roomId}`;
  console.log(`导航到: ${url}`);

  try {
    // 导航到页面
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    console.log('页面加载成功\n');

    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');

    // 等待3秒钟，让动态内容加载
    await page.waitForTimeout(3000);

    // 分析页面结构
    console.log('=== 页面结构分析 ===\n');

    // 获取页面的主要容器元素
    const bodyContent = await page.evaluate(() => {
      // 获取body的HTML内容
      return document.body.innerHTML;
    });

    // 简单分析主要的CSS类名
    const mainClasses = await page.evaluate(() => {
      const classes = new Set();
      const elements = document.querySelectorAll('*');

      elements.forEach(element => {
        if (element.className) {
          const classNames = element.className.split(/\s+/);
          classNames.forEach(className => {
            if (className) {
              classes.add(className);
            }
          });
        }
      });

      return Array.from(classes).sort();
    });

    console.log('主要CSS类名列表:');
    console.log(
      mainClasses.filter(
        cls =>
          cls.includes('monitor') ||
          cls.includes('config') ||
          cls.includes('content')
      )
    );
    console.log('\n');

    // 查找特定元素
    console.log('=== 关键元素查找 ===\n');

    // 查找监控容器
    const monitorContainers = await page.$$('*[class*="monitor"]');
    console.log(`找到 ${monitorContainers.length} 个包含 "monitor" 的元素`);

    // 查找内容区域
    const contentAreas = await page.$$('*[class*="content"]');
    console.log(`找到 ${contentAreas.length} 个包含 "content" 的元素`);

    // 查找配置面板
    const configPanels = await page.$$('*[class*="config"]');
    console.log(`找到 ${configPanels.length} 个包含 "config" 的元素`);

    // 查找标签页
    const tabs = await page.$$('*[class*="tab"]');
    console.log(`找到 ${tabs.length} 个包含 "tab" 的元素`);

    // 查找按钮
    const buttons = await page.$$('button');
    console.log(`找到 ${buttons.length} 个按钮元素`);

    // 查找输入框
    const inputs = await page.$$('input');
    console.log(`找到 ${inputs.length} 个输入框元素`);

    // 输出更详细的元素信息
    console.log('\n=== 详细元素信息 ===\n');

    // 获取监控相关元素的详细信息
    const monitorElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*[class*="monitor"]');
      return Array.from(elements).map((element, index) => {
        return {
          index: index + 1,
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          outerHTML: element.outerHTML.slice(0, 200) + '...', // 只显示前200个字符
        };
      });
    });

    console.log('监控相关元素:');
    console.log(JSON.stringify(monitorElements, null, 2));

    console.log('\n=== 分析完成 ===');
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    // 关闭浏览器
    await browser.close();
    console.log('\n浏览器已关闭');
  }
}

// 执行分析
analyzePageStructure();
