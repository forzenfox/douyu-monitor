/**
 * Playwright测试报告生成脚本（CommonJS版本）
 * 功能：解析Playwright生成的JSON报告，生成可读性更好的测试结果文件
 */

const fs = require('fs');
const path = require('path');

/**
 * 解析Playwright JSON报告，生成可读的测试结果
 * @param {string} jsonReportPath - JSON报告文件路径
 * @returns {Object} 解析后的测试结果
 */
function parsePlaywrightReport(jsonReportPath) {
  try {
    // 读取JSON报告文件
    const reportData = fs.readFileSync(jsonReportPath, 'utf8');
    const report = JSON.parse(reportData);
    
    // 收集所有测试结果
    const allTestResults = [];
    const allSuites = [];
    
    // 递归遍历测试套件
    function traverseSuites(suites) {
      for (const suite of suites) {
        allSuites.push({
          title: suite.title,
          status: suite.ok ? 'passed' : 'failed',
          duration: 0, // 单个套件没有持续时间，需要从测试中计算
          tests: suite.specs?.map(spec => spec.title) || []
        });
        
        // 处理子套件
        if (suite.suites && suite.suites.length > 0) {
          traverseSuites(suite.suites);
        }
        
        // 处理测试用例
        if (suite.specs && suite.specs.length > 0) {
          for (const spec of suite.specs) {
            for (const test of spec.tests) {
              for (const result of test.results) {
                allTestResults.push({
                  title: spec.title,
                  status: result.status,
                  duration: result.duration,
                  errors: result.errors?.map(error => error.message) || [],
                  attachments: result.attachments?.map(attachment => attachment.name) || [],
                  project: test.projectName
                });
              }
            }
          }
        }
      }
    }
    
    // 开始遍历
    traverseSuites(report.suites);
    
    // 计算总持续时间
    const totalDuration = allTestResults.reduce((sum, test) => sum + test.duration, 0);
    
    // 解析测试结果
    const result = {
      summary: {
        startTime: new Date(report.stats.startTime).toLocaleString(),
        endTime: new Date(report.stats.startTime * 1000 + report.stats.duration).toLocaleString(),
        duration: report.stats.duration,
        totalTests: allTestResults.length,
        passedTests: allTestResults.filter(test => test.status === 'passed').length,
        failedTests: allTestResults.filter(test => test.status === 'failed').length,
        skippedTests: allTestResults.filter(test => test.status === 'skipped').length,
        flakyTests: allTestResults.filter(test => test.status === 'flakey').length
      },
      tests: allTestResults,
      suites: allSuites
    };
    
    return result;
  } catch (error) {
    console.error('解析测试报告失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return null;
  }
}

/**
 * 生成Markdown格式的测试报告
 * @param {Object} parsedResult - 解析后的测试结果
 * @param {string} outputPath - 输出文件路径
 */
function generateMarkdownReport(parsedResult, outputPath) {
  try {
    const { summary, tests, suites } = parsedResult;
    
    // 生成Markdown内容
    let markdownContent = '# Playwright测试报告\n\n';
    
    // 添加测试摘要
    markdownContent += '## 测试摘要\n\n';
    markdownContent += `| 项目 | 数值 |\n`;
    markdownContent += `|------|------|\n`;
    markdownContent += `| 开始时间 | ${summary.startTime} |\n`;
    markdownContent += `| 结束时间 | ${summary.endTime} |\n`;
    markdownContent += `| 总时长 | ${(summary.duration / 1000).toFixed(2)} 秒 |\n`;
    markdownContent += `| 总测试数 | ${summary.totalTests} |\n`;
    markdownContent += `| 通过测试 | ${summary.passedTests} |\n`;
    markdownContent += `| 失败测试 | ${summary.failedTests} |\n`;
    markdownContent += `| 跳过测试 | ${summary.skippedTests} |\n`;
    markdownContent += `| 不稳定测试 | ${summary.flakyTests} |\n`;
    markdownContent += `| 通过率 | ${((summary.passedTests / summary.totalTests) * 100).toFixed(2)}% |\n\n`;
    
    // 添加测试套件信息
    markdownContent += '## 测试套件\n\n';
    suites.forEach(suite => {
      markdownContent += `### ${suite.title}\n`;
      markdownContent += `状态: **${suite.status}**\n\n`;
    });
    
    // 添加测试用例详细信息
    markdownContent += '## 测试用例详情\n\n';
    tests.forEach((test, index) => {
      markdownContent += `${index + 1}. **${test.title}**\n`;
      markdownContent += `   状态: **${test.status}** | 项目: **${test.project}** | 时长: ${(test.duration / 1000).toFixed(2)} 秒\n`;
      
      if (test.errors.length > 0) {
        markdownContent += '   错误信息:\n';
        test.errors.forEach(error => {
          markdownContent += `   - ${error}\n`;
        });
      }
      
      if (test.attachments.length > 0) {
        markdownContent += '   附件:\n';
        test.attachments.forEach(attachment => {
          markdownContent += `   - ${attachment}\n`;
        });
      }
      markdownContent += '\n';
    });
    
    // 写入Markdown文件
    fs.writeFileSync(outputPath, markdownContent, 'utf8');
    console.log(`✅ Markdown测试报告已生成: ${outputPath}`);
  } catch (error) {
    console.error('生成Markdown报告失败:', error.message);
  }
}

/**
 * 生成简单的文本格式测试报告
 * @param {Object} parsedResult - 解析后的测试结果
 * @param {string} outputPath - 输出文件路径
 */
function generateTextReport(parsedResult, outputPath) {
  try {
    const { summary, tests } = parsedResult;
    
    // 生成文本内容
    let textContent = '=== Playwright测试报告 ===\n\n';
    
    // 添加测试摘要
    textContent += '--- 测试摘要 ---\n';
    textContent += `开始时间: ${summary.startTime}\n`;
    textContent += `结束时间: ${summary.endTime}\n`;
    textContent += `总时长: ${(summary.duration / 1000).toFixed(2)} 秒\n\n`;
    textContent += `总测试数: ${summary.totalTests}\n`;
    textContent += `通过测试: ${summary.passedTests}\n`;
    textContent += `失败测试: ${summary.failedTests}\n`;
    textContent += `跳过测试: ${summary.skippedTests}\n`;
    textContent += `不稳定测试: ${summary.flakyTests}\n`;
    textContent += `通过率: ${((summary.passedTests / summary.totalTests) * 100).toFixed(2)}%\n\n`;
    
    // 添加测试用例结果
    textContent += '--- 测试用例结果 ---\n';
    tests.forEach((test, index) => {
      textContent += `${index + 1}. [${test.status.toUpperCase()}] ${test.title} (${test.project})\n`;
      textContent += `   时长: ${(test.duration / 1000).toFixed(2)} 秒\n`;
      
      if (test.errors.length > 0) {
        textContent += '   错误信息:\n';
        test.errors.forEach(error => {
          textContent += `   - ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}\n`;
        });
      }
      textContent += '\n';
    });
    
    // 写入文本文件
    fs.writeFileSync(outputPath, textContent, 'utf8');
    console.log(`✅ 文本测试报告已生成: ${outputPath}`);
  } catch (error) {
    console.error('生成文本报告失败:', error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 测试报告生成脚本开始执行');
  const args = process.argv.slice(2);
  
  // 默认参数
  const jsonReportPath = args[0] || 'playwright-report/results.json';
  const outputDir = args[1] || 'playwright-report';
  
  // 检查JSON报告文件是否存在
  if (!fs.existsSync(jsonReportPath)) {
    console.error(`❌ JSON报告文件不存在: ${jsonReportPath}`);
    console.error('请先运行Playwright测试生成报告');
    process.exit(1);
  }
  
  // 解析测试报告
  console.log(`📋 正在解析测试报告: ${jsonReportPath}`);
  const parsedResult = parsePlaywrightReport(jsonReportPath);
  
  if (!parsedResult) {
    console.error('❌ 解析测试报告失败');
    process.exit(1);
  }
  
  // 生成报告文件
  const markdownReportPath = path.join(outputDir, 'test-results.md');
  const textReportPath = path.join(outputDir, 'test-results.txt');
  
  generateMarkdownReport(parsedResult, markdownReportPath);
  generateTextReport(parsedResult, textReportPath);
  
  console.log('\n🎉 测试报告生成完成！');
  console.log(`📊 Markdown报告: ${markdownReportPath}`);
  console.log(`📄 文本报告: ${textReportPath}`);
  console.log(`📋 JSON报告: ${jsonReportPath}`);
}

// 执行主函数
main();
