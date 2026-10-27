# GitHub Pages 部署解决方案

## 自定义域名部署说明（2026-10-27 更新）

当前站点通过 GitHub Pages 自定义域名 `dm.forzenfox.com` 对外访问（Cloudflare 仅做 DNS 代理，CNAME 指向 `forzenfox.github.io`）。GitHub Pages 会把项目站点发布到自定义域名的**根路径**，因此：

- `vite.config.js` 中的 `base` 固定为 `/`，**不使用动态 base**；
- 构建产物中的资源路径为 `/assets/...`，与 Artifact 根目录（`dist`）一致；
- 历史文档中的 `https://forzenfox.github.io/douyu-monitor/...` 地址会被 GitHub Pages 301 重定向到 `https://dm.forzenfox.com/...`，路径不变，旧链接仍可用；
- 房间号路径（如 `/317422`）通过 `dist/404.html` 回退到单页应用，该机制保持不变。

> 若未来需要同时部署到 `https://<user>.github.io/douyu-monitor/` 子路径，需要重新评估 `base` 配置（如引入构建环境变量），当前不启用。

## 问题分析
GitHub Pages是静态网站托管服务，只能访问静态资源。当访问类似 `https://forzenfox.github.io/douyu-monitor/317422` 这样带有房间号的URL时，GitHub Pages会尝试查找名为 `317422` 的静态文件，找不到就返回404错误，而我们的项目需要从URL中提取房间号并动态加载内容。

## 解决方案

### 1. 优化构建流程
- 修改了`package.json`，添加了`copy-404`脚本
- 在`build`脚本中添加了`&& npm run copy-404`，确保构建后自动执行`copy-404`脚本
- `copy-404`脚本使用Node.js的fs模块，将`dist/index.html`复制为`dist/404.html`
- 删除了`public`目录中的手动创建的404.html文件

### 2. 自动生成404.html
- 每次构建时，404.html都会与index.html完全一致，包括资源引用
- 自动处理Vite构建生成的带哈希值的资源文件名
- 无需手动维护404.html文件
- 兼容所有平台

### 3. 利用GitHub Pages的404机制
- 当GitHub Pages找不到请求的资源时，会返回404.html文件
- 404.html文件会加载Vue应用
- Vue应用会从URL中提取房间号（`/317422`）
- 应用正常显示并连接到指定房间

## 工作原理
1. 用户访问 `https://forzenfox.github.io/douyu-monitor/317422`
2. GitHub Pages找不到 `317422` 静态文件
3. GitHub Pages返回自动生成的404.html文件
4. 404.html加载Vue应用
5. Vue应用从URL中提取房间号 `317422`
6. 应用正常显示并连接到指定房间

## 技术细节
- 使用Node.js脚本来复制文件，确保在所有平台上都能正常工作
- 自动处理Vite构建生成的带哈希值的资源文件名
- 无需手动维护404.html文件
- 构建流程简单可靠

## 后续步骤
- 代码已经成功推送到GitHub仓库
- GitHub Actions工作流会自动部署更新后的版本
- 部署完成后，访问 `https://forzenfox.github.io/douyu-monitor/317422` 就能正常进入带有房间号的页面

这个解决方案确保了404.html与index.html完全一致，包括资源引用，自动处理Vite构建生成的带哈希值的资源文件名，无需手动维护404.html文件，兼容所有平台，构建流程简单可靠。