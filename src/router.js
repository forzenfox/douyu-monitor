import { PAGE_TYPE, PAGE_PATH, DEFAULT_RID } from './lvjiang/options.js';
import { createEntryPrompt } from './entryPrompt.js';

async function parseUrl() {
  let url = window.location.href;
  let info = {};

  // 本站
  info = getInfo(url);

  // 检测是否有房间号
  if (!info.rid || info.rid === '') {
    let entry = null;

    try {
      // 使用自定义弹窗让用户选择进入的页面
      entry = await createEntryPrompt();
    } catch (error) {
      console.error('创建入口选择弹窗失败:', error);
    }

    // 选择团播看板：直接跳转到团播看板页
    if (entry && entry.type === PAGE_TYPE) {
      location.href = `${window.location.origin}/${PAGE_PATH}`;
      // 正在跳转，调用方无需挂载应用
      return { redirect: true };
    }

    let rid = entry && entry.type === 'monitor' ? entry.rid : '';

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
        if (
          pathParts.length > 0 &&
          !isNaN(Number(pathParts[pathParts.length - 1]))
        ) {
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
      // 正在跳转，调用方无需挂载应用
      return { redirect: true };
    } else {
      // 用户取消输入或弹窗创建失败，使用默认房间号或继续执行
      console.log('用户取消输入房间号或弹窗创建失败');
    }
  } else {
    // 获取真实房间号（团播看板页房间号固定，无需转换）
    if (info.type === PAGE_TYPE) {
      return info;
    }
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
  let rid = getQueryVariable('rid');
  let options = getQueryVariable('exoptions');
  options = options ? decodeURIComponent(options) : '';

  // 团播看板页：路径末段为 lvjiangqingchuntuan，房间号固定 317422（?rid= 优先）
  const lastPath = String(url).split('?')[0].split('/').pop();
  if (lastPath === PAGE_PATH) {
    ret.type = PAGE_TYPE;
    ret.rid = rid && rid !== '' ? rid : DEFAULT_RID;
    return ret;
  }

  if (!rid) {
    let arr = String(url).split('/');
    ret.rid = arr[arr.length - 1].split('?')[0];
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
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

export { parseUrl };
