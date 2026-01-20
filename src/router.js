async function parseUrl() {
    let url = window.location.href;
    let info = {};
    
    // 本站
    info = getInfo(url);
    
/**
 * 创建自定义弹窗
 * @returns {Promise<string|null>} 用户输入的房间号，取消则返回null
 */
function createCustomPrompt() {
    return new Promise((resolve) => {
        // 创建弹窗容器
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        `;

        // 创建弹窗内容
        const content = document.createElement('div');
        content.style.cssText = `
            background-color: white;
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        `;

        // 创建标题
        const title = document.createElement('h3');
        title.textContent = '请输入真实房间号';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
        `;
        content.appendChild(title);

        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '请输入房间号';
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            border: 1px solid #dcdfe6;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
            transition: all 0.2s;
        `;
        input.addEventListener('focus', () => {
            input.style.borderColor = '#409eff';
            input.style.outline = 'none';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#dcdfe6';
        });
        content.appendChild(input);

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        `;
        content.appendChild(buttonContainer);

        // 创建取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #dcdfe6;
            border-radius: 8px;
            background-color: white;
            color: #606266;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(null);
        });
        buttonContainer.appendChild(cancelBtn);

        // 创建确定按钮
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确定';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            background-color: #409eff;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        confirmBtn.addEventListener('click', () => {
            const value = input.value.trim();
            document.body.removeChild(modal);
            resolve(value);
        });
        buttonContainer.appendChild(confirmBtn);

        // 添加到文档
        modal.appendChild(content);
        document.body.appendChild(modal);

        // 自动聚焦输入框
        input.focus();

        // 监听回车键
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.trim();
                document.body.removeChild(modal);
                resolve(value);
            }
        });

        // 监听ESC键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                resolve(null);
            }
        });
    });
}

    // 检测是否有房间号
    if (!info.rid || info.rid === '') {
        let rid = '';
        
        try {
            // 使用自定义弹窗替代原生prompt
            rid = await createCustomPrompt();
        } catch (error) {
            console.error('创建自定义弹窗失败:', error);
            // 失败时使用默认值
            rid = '';
        }
        
        if (rid && rid.trim() !== '') {
            // 构建新的URL，使用路径参数形式
            const baseUrl = window.location.origin;
            const pathname = window.location.pathname;
            let newUrl = '';
            
            // 移除可能存在的查询参数
            const cleanPathname = pathname.split('?')[0];
            
            // 检查URL结构，构建正确的路径
            if (cleanPathname === '/' || cleanPathname === '') {
                // 根路径，直接添加房间号
                newUrl = `${baseUrl}/${rid.trim()}`;
            } else {
                // 已有路径，替换或添加房间号
                const pathParts = cleanPathname.split('/').filter(Boolean);
                // 检查路径是否已经包含房间号
                if (pathParts.length > 0 && !isNaN(Number(pathParts[pathParts.length - 1]))) {
                    // 替换最后一个路径段为新房间号
                    pathParts[pathParts.length - 1] = rid.trim();
                } else {
                    // 添加房间号作为最后一个路径段
                    pathParts.push(rid.trim());
                }
                newUrl = `${baseUrl}/${pathParts.join('/')}`;
            }
            
            // 跳转到新URL
            location.href = newUrl;
            // 阻止后续代码执行
            throw new Error('Redirecting to URL with rid');
        } else {
            // 用户取消输入或弹窗创建失败，使用默认房间号或继续执行
            console.log('用户取消输入房间号或弹窗创建失败');
        }
    } else {
        // 获取真实房间号
        try {
            const realRid = await getRealRid(info.rid);
            info.rid = realRid;
        } catch (error) {
            console.error('获取真实房间号失败:', error);
            // 获取失败时使用原始房间号
        }
    }
    return info;
}

/**
 * 获取真实房间号
 * @param {string} rid - 原始房间号
 * @returns {Promise<string>} 真实房间号
 */
async function getRealRid(rid) {
    try {
        // 使用本地代理API解决CORS问题
        const res = await fetch(`/api/roominfo/${rid}`);
        const data = await res.json();
        if (data.data && data.data.room_id) {
            return data.data.room_id;
        }
        return rid;
    } catch (error) {
        console.error('获取真实房间号失败:', error);
        return rid;
    }
}

function getInfo(url) {
    let ret = {};
    let rid = getQueryVariable("rid");
    let options = getQueryVariable("exoptions");
    options = options ? decodeURIComponent(options) : "";
    if (!rid) {
        let arr = String(url).split("/");
        ret.rid = arr[arr.length - 1].split("?")[0];
    } else {
        ret.rid = rid;
    }
    if (options) {
        ret.options = options;
    }
    return ret;
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

export {
    parseUrl
}