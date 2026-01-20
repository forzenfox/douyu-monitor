import { ref } from 'vue';
import { Ex_WebSocket_UnLogin } from '@/global/utils/websocket.js';
import { STT } from '@/global/utils/stt.js';
import { getStrMiddle } from '@/global/utils';
import { nobleData } from '@/global/utils/dydata/nobleData.js';
import { speakText } from '@/global/utils/speak.js';

export function useWebsocket(options, allGiftData) {
  let ws = null;
  let stt = new STT();
  let danmakuList = ref([]);
  let enterList = ref([]);
  let giftList = ref([]);
  let superchatList = ref([]);
  let commandDanmakuList = ref([]);

  // 连接状态
  let isConnected = ref(false);
  let reconnectCount = ref(0);

  let danmakuListSave = [];
  let enterListSave = [];
  let giftListSave = [];
  let superchatListSave = [];
  let commandDanmakuListSave = [];

  // 超级弹幕映射表，用于存储用户的礼物贡献
  let superchatMap = {};

  // 已处理消息ID集合，用于去重
  let processedMessageIds = new Set();

  // 超级弹幕过期清理定时器
  let superchatCleanupTimer = null;

  // WebSocket重连相关配置
  let reconnectTimer = null;
  const MAX_RECONNECT_ATTEMPTS = 50; // 最大重连次数
  const BASE_RECONNECT_INTERVAL = 1000; // 基础重连间隔（毫秒）
  const MAX_RECONNECT_INTERVAL = 60000; // 最大重连间隔（毫秒）

  // 心跳检测相关
  let heartbeatTimer = null;
  const HEARTBEAT_INTERVAL = 30000; // 心跳间隔（毫秒）
  let lastHeartbeatTime = 0;

  /**
   * 更新超级弹幕的过期状态
   */
  const updateSuperchatExpireStatus = () => {
    if (superchatList.value.length === 0) return;

    const now = Date.now();

    superchatList.value.forEach(item => {
      // 获取持续时间
      const duration = item.duration || 60; // 默认1分钟

      // 计算过期时间（创建时间 + 持续时间，单位：毫秒）
      const expireTime = item.createdAt + duration * 1000;

      // 更新过期状态
      item.isExpired = now > expireTime;
    });
  };

  /**
   * 计算重连间隔，使用指数退避策略
   * @returns {number} 重连间隔时间（毫秒）
   */
  const calculateReconnectInterval = () => {
    // 指数退避算法：base * (2 ^ (reconnectCount - 1)) + 随机值
    const interval = Math.min(
      BASE_RECONNECT_INTERVAL * Math.pow(2, reconnectCount.value - 1),
      MAX_RECONNECT_INTERVAL
    );
    // 添加随机抖动，避免多个客户端同时重连
    const jitter = Math.random() * 1000;
    return interval + jitter;
  };

  /**
   * 清理所有资源
   */
  const cleanupResources = () => {
    // 清理WebSocket连接
    if (ws) {
      ws.close();
      ws = null;
    }

    // 清理重连定时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // 清理心跳定时器
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    // 清理超级弹幕过期清理定时器
    if (superchatCleanupTimer) {
      clearInterval(superchatCleanupTimer);
      superchatCleanupTimer = null;
    }
  };

  /**
   * 启动心跳检测
   * @param {string} rid - 房间号
   */
  const startHeartbeat = rid => {
    // 清理旧的心跳定时器
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    // 启动新的心跳定时器
    heartbeatTimer = setInterval(() => {
      const now = Date.now();
      // 检查是否超过心跳间隔，如果超过则重新连接
      if (now - lastHeartbeatTime > HEARTBEAT_INTERVAL * 2) {
        reconnectCount.value++;
        reconnectWs(rid);
      }
    }, HEARTBEAT_INTERVAL);
  };

  /**
   * 重新连接WebSocket
   * @param {string} rid - 房间号
   */
  const reconnectWs = rid => {
    if (reconnectCount.value >= MAX_RECONNECT_ATTEMPTS) {
      isConnected.value = false;
      return;
    }

    // 清理旧资源
    cleanupResources();

    // 计算重连间隔
    const interval = calculateReconnectInterval();

    // 设置重连定时器
    reconnectTimer = setTimeout(() => {
      connectWs(rid);
    }, interval);
  };

  const connectWs = rid => {
    if (rid === '') {
      return;
    }

    // 清理旧资源
    cleanupResources();

    try {
      ws = new Ex_WebSocket_UnLogin(
        rid,
        msg => {
          // 更新最后心跳时间
          lastHeartbeatTime = Date.now();

          if (!isConnected.value) {
            isConnected.value = true;
            reconnectCount.value = 0;
            lastHeartbeatTime = Date.now();
            // 连接成功后启动心跳检测
            startHeartbeat(rid);
          }
          handleMsg(msg);
        },
        () => {
          // 连接错误，触发重连
          isConnected.value = false;
          reconnectCount.value++;
          reconnectWs(rid);
        }
      );

      // WebSocket连接关闭时更新状态并触发重连
      ws.onclose = () => {
        isConnected.value = false;
        reconnectCount.value++;
        reconnectWs(rid);
      };

      // WebSocket连接错误时更新状态
      ws.onerror = () => {
        isConnected.value = false;
      };

      // 启动超级弹幕过期状态更新定时器
      superchatCleanupTimer = setInterval(updateSuperchatExpireStatus, 1000);
    } catch {
      isConnected.value = false;
      reconnectCount.value++;
      reconnectWs(rid);
    }
  };

  /**
   * 清理字段值，移除可能的前缀等异常字符
   * @param {string} value - 字段值
   * @returns {string} 清理后的字段值
   */
  const cleanFieldValue = value => {
    if (!value) return '';
    // 移除可能的前缀"="和换行符
    return String(value)
      .replace(/^=+/, '')
      .replace(/[\r\n]/g, '')
      .trim();
  };

  /**
   * 解析chatmsg字段，处理@S分隔的子字段
   * @param {string|Object|Array} chatmsg - chatmsg字段值
   * @returns {Object} 解析后的chatmsg对象
   */
  const parseChatmsg = chatmsg => {
    if (!chatmsg) return {};

    // 处理数组情况
    if (Array.isArray(chatmsg)) {
      const result = {};
      // 遍历数组中的每个对象，合并字段
      chatmsg.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, item);
        }
      });
      return result;
    }

    // 处理对象情况
    if (typeof chatmsg === 'object' && chatmsg !== null) {
      return chatmsg;
    }

    // 处理字符串情况
    const result = {};
    const fields = chatmsg.replace(/@S/g, '&').split('&');

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

  /**
   * 生成超级弹幕
   * @param {Object} data - 消息数据
   * @param {number} price - 超级弹幕价格
   * @returns {Object} 超级弹幕对象
   */
  const generateSuperchat = (data, price) => {
    // 确保价格为有效数字，最低为0
    const validPrice = Math.max(0, parseFloat(price) || 0);

    // 从多种可能的字段中获取用户信息，确保兼容不同消息类型
    // 特别处理voiceDanmu类型，从chatmsg对象中提取真实的用户信息和弹幕内容
    const chatmsg = parseChatmsg(data.chatmsg);
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

    // 计算持续时间（秒）
    let duration = 60; // 默认1分钟
    if (validPrice >= 500) {
      duration = 300; // 5分钟
    } else if (validPrice >= 50) {
      duration = 120; // 2分钟
    }

    // 从配置中获取背景颜色，根据价格匹配对应的配置项
    let bgColor = { header: 'rgb(21,101,192)', body: 'rgb(30,136,229)' }; // 默认蓝色

    // 获取超级弹幕配置选项
    const superchatOptions = options.value?.superchat?.options || [];

    // 找到价格对应的配置项（配置项是按从高到低排序的）
    for (const option of superchatOptions) {
      if (validPrice >= option.minPrice) {
        bgColor = option.bgColor;
        break;
      }
    }

    // 提取显示项相关字段
    // 从多种可能的字段中获取显示项信息，确保兼容不同消息类型
    const fansName = cleanFieldValue(
      chatmsg.bnn || data.bnn || data.fansName || ''
    );
    // 确保粉丝牌等级始终是有效的数字，避免出现NaN
    const blValue = chatmsg.bl || data.bl || data.fansLv || '0';
    const fansLv = isNaN(Number(blValue)) ? 0 : Number(blValue);
    const noble = Boolean(chatmsg.nl || data.nl || data.noble);
    const roomAdmin = Boolean(
      chatmsg.rg === 4 || data.rg === 4 || data.roomAdmin
    );
    const diamond = Boolean(chatmsg.diaf || data.diaf || data.diamond);
    const time = Number(data.now || data.time || Date.now()) / 1000; // 转换为秒级时间戳

    const superchat = {
      nn: nickname, // 昵称，确保有默认值
      avatar: avatar, // 头像地址，确保有默认值
      txt: content, // 弹幕内容，确保有默认值
      price: validPrice, // 使用有效价格
      level: level, // 等级
      bgColor: bgColor, // 动态生成背景颜色
      textColor: '#FFFFFF', // 默认文字颜色为白色
      nicknameColor: '#FFFFFF', // 默认昵称颜色为白色
      key: data.cid || new Date().getTime() + Math.random(), // 唯一标识
      duration: duration, // 添加持续时间字段
      createdAt: Date.now(), // 创建时间
      isExpired: false,
      // 显示项相关字段
      fansName: fansName, // 粉丝牌名称
      fansLv: fansLv, // 粉丝牌等级
      noble: noble, // 是否是贵族
      roomAdmin: roomAdmin, // 是否是房管
      diamond: diamond, // 是否是钻粉
      time: time, // 时间戳（秒级）
    };

    return superchat;
  };

  const handleMsg = msg => {
    // 提取消息ID，用于去重
    const msgId =
      getStrMiddle(msg, 'cid@=', '/') ||
      getStrMiddle(msg, 'vrid@=', '/') ||
      getStrMiddle(msg, 'now@=', '/') ||
      Date.now().toString();

    // 检查消息是否已处理过
    if (processedMessageIds.has(msgId)) {
      return;
    }

    // 标记消息为已处理
    processedMessageIds.add(msgId);

    let msgType = getStrMiddle(msg, 'type@=', '/');
    if (!msgType) {
      return;
    }

    // 处理普通弹幕
    if (msgType === 'chatmsg' && options.value.switch.includes('danmaku')) {
      let data = stt.deserialize(msg);
      // 超管弹幕
      if (!checkDanmakuValid(data)) {
        return;
      }

      // 检查是否有超级弹幕关键词
      const hasSuperchatKeyword = data.txt.includes(
        options.value.superchat.keyword
      );

      // 检查用户是否有足够的礼物贡献
      const superchatData = superchatMap[data.uid];

      // 取消权限限制，所有用户都可以发送超级弹幕
      if (
        hasSuperchatKeyword &&
        superchatData &&
        superchatData.count >= 1 &&
        options.value.switch.includes('superchat')
      ) {
        // 生成超级弹幕
        const superchat = generateSuperchat(data, superchatData.price);

        if (superchatList.value.length + 1 > options.value.threshold) {
          superchatList.value.shift();
        }
        superchatList.value.push(superchat);

        // 语音播报
        if (options.value.superchat.speak) {
          speakText(`${data.nn}说：${data.txt}`);
        }

        if (options.value.isSaveData) {
          superchatListSave.push(msg);
        }

        // 移除用户的超级弹幕贡献
        delete superchatMap[data.uid];
      } else {
        // 普通弹幕处理
        let obj = {
          nn: data.nn, // 昵称
          avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
          lv: data.level, // 等级
          txt: data.txt, // 弹幕内容
          color: data.col, // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
          fansName: data.bnn, // 粉丝牌名字
          fansLv: data.bl, // 粉丝牌等级
          diamond: data.diaf, // 是否是钻粉
          noble: data.nl, // 贵族等级
          nobleC: data.nc, // 贵族弹幕是否开启，1开
          roomAdmin: data.rg, // 房管，data.rg为4则是房管
          super: data.pg, // 超管，data.pg为5则为超管
          vip: data.ail == '453/' || data.ail == '454/', // vip，如果是 453/则为vip  454/则为超级vip
          key: data.cid, // 时间戳
        };
        if (danmakuList.value.length + 1 > options.value.threshold) {
          danmakuList.value.shift();
        }
        danmakuList.value.push(obj);
        if (options.value.isSaveData) {
          danmakuListSave.push(msg);
        }

        // 检查是否为指令弹幕
        const commandDanmaku = checkCommandDanmakuValid(data);
        if (commandDanmaku && options.value.switch.includes('commandDanmaku')) {
          if (commandDanmakuList.value.length + 1 > options.value.threshold) {
            commandDanmakuList.value.shift();
          }
          commandDanmakuList.value.push(commandDanmaku);
          if (options.value.isSaveData) {
            commandDanmakuListSave.push(msg);
          }

          // 添加语音提示
          if (options.value.commandDanmaku.speak) {
            speakText(
              `${commandDanmaku.userName} 发送了指令：${commandDanmaku.command} ${commandDanmaku.commandContent}`
            );
          }
        }
      }
    }

    // 处理真实超级弹幕消息类型
    if (
      (msgType === 'sc' ||
        msgType === 'superchat' ||
        msgType === 'fansPaper' ||
        msgType === 'professgiftsrc' ||
        msgType === 'voiceDanmu') &&
      options.value.switch.includes('superchat')
    ) {
      let data = stt.deserialize(msg);

      let price = 10; // 默认价格
      let txt = '';

      // 根据不同消息类型处理
      switch (msgType) {
        case 'sc':
        case 'superchat':
          // 标准超级弹幕消息
          price = data.price || data.cost || 10;
          txt = data.txt || data.msg || '';
          break;

        case 'fansPaper':
          // 粉丝牌弹幕
          // 根据文本级别计算价格（负值）
          price = data.textLevel || -1;
          txt = data.txt || '';
          break;

        case 'professgiftsrc':
          // 专业礼物弹幕
          // 固定价格级别
          price = -3;
          txt = data.txt || '';
          break;

        case 'voiceDanmu':
          // 语音弹幕
          // 基于真实价格计算，优先使用crealPrice，否则使用cprice
          price = data.crealPrice
            ? Number(data.crealPrice) / 100
            : data.cprice
              ? Number(data.cprice) / 100
              : 10;
          // 优先从chatmsg对象中获取文本内容
          const chatmsg = data.chatmsg || {};
          txt = chatmsg.txt || data.txt || '';
          break;
      }

      // 生成超级弹幕
      // 优先从chatmsg对象中获取用户信息
      const chatmsg = data.chatmsg || {};
      const superchat = generateSuperchat(
        {
          ...data,
          chatmsg: chatmsg,
          txt: txt,
          nn: chatmsg.nn || data.nn || data.userName || '匿名用户',
          avatar: chatmsg.ic || data.ic || data.avatar || '',
          uid:
            data.uid || data.userId || Math.random().toString(36).substr(2, 9),
        },
        price
      );

      if (superchatList.value.length + 1 > options.value.threshold) {
        superchatList.value.shift();
      }
      superchatList.value.push(superchat);

      // 语音播报
      if (options.value.superchat.speak) {
        const userName = data.nn || data.userName || '匿名用户';
        speakText(`${userName}说：${txt}`);
      }

      if (options.value.isSaveData) {
        superchatListSave.push(msg);
      }
    }

    // 礼物信息
    if (
      [
        'dgb',
        'odfbc',
        'rndfbc',
        'anbc',
        'rnewbc',
        'blab',
        'fansupgradebroadcast',
      ].includes(msgType) &&
      options.value.switch.includes('gift')
    ) {
      let data = stt.deserialize(msg);
      // 续费钻粉
      // {"type":"rndfbc","uid":"573096","rid":"5189167","nick":"一只小洋丶","icon":"avatar_v3/202111/d7d383be4c874af0b50e3d9eb58ad462","level":"39","nl":"0","pg":"1","fl":"24","bn":"歆崽"}

      // 开通钻粉
      // {"type":"odfbc","uid":"341314282","rid":"5189167","nick":"nt五香蛋","icon":"avatar_v3/202103/04d3d252139f4620bd417c6bef673bd6","level":"36","nl":"0","pg":"1","fl":"22","bn":"歆崽"}

      // 续费贵族
      // type@=rnewbc/rid@=0/gid@=0/bt@=1/uid@=21586042/unk@=卡卡罗特u丶/uic@=avatar_v3@S202109@Sb2f34417c7f54595b14f8b3ad9243217/drid@=8780046/donk@=妮妮别吃了/nl@=5/

      // 开通贵族
      // type@=anbc/rid@=0/gid@=0/bt@=1/uid@=420070299/hrp@=1/unk@=王嘉尔一个人/uic@=avatar_v3@S202112@Sa60b00aa5e5845878ae43ff8299122bf/drid@=7034970/donk@=野鸡娘娘/nl@=4/ts@=1641350115/fov@=1/

      // 粉丝牌升级
      // type@=blab/uid@=377858580/nn@=Heroes728/lbl@=13/bl@=14/ba@=1/bnn@=教主丶/diaf@=0/rid@=312212/

      // 30级以上粉丝牌升级
      // btype@=fansupgradebroadcast/blackCate2s@=/avatar@=/blackUids@=/type@=configscreen/rid@=533813/userName@=命運舵手/anchorName@=TD丶正直博/blackRids@=/gbtemp@=465/nrt@=0/txt2@=/txt3@=/userLevelMin@=0/now@=1641356569850/txt1@=/blackCate1s@=/vsrc@=/otherContent@=41/
      let obj = {};
      switch (msgType) {
        case 'dgb':
          // 正常礼物
          if (!checkGiftValid(data)) {
            return;
          }
          obj = {
            type: '礼物',
            nn: data.nn, // 昵称
            lv: data.level, // 等级
            gfid: data.gfid, // 礼物id 获取名字：allGiftData[item.gfid].n
            gfcnt: data.gfcnt, // 礼物数量
            hits: data.hits, // 连击
            key: new Date().getTime() + Math.random(),
          };
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          if (options.value.isSaveData) {
            giftListSave.push(msg);
          }

          // 检查是否满足超级弹幕条件
          if (options.value.switch.includes('superchat')) {
            const giftData = allGiftData.value[data.gfid];
            if (giftData) {
              // 计算礼物总价值（单位：元）
              const totalGiftPrice =
                (Number(data.gfcnt) * Number(giftData.pc)) / 100;
              // 获取最低超级弹幕价格，确保options.value.superchat.options存在
              const superchatOptions = options.value?.superchat?.options || [];
              const superchatMinPrice =
                superchatOptions[superchatOptions.length - 1]?.minPrice;

              if (totalGiftPrice >= superchatMinPrice) {
                // 添加到超级弹幕映射表
                superchatMap[data.uid] = {
                  count: 1,
                  price: totalGiftPrice,
                };
              }
            }
          }
          break;
        case 'odfbc':
          // 开通钻粉
          obj = {
            type: '钻粉',
            name: '开通钻粉',
            nn: data.nick,
            lv: data.level,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
          };
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          if (options.value.isSaveData) {
            giftListSave.push(msg);
          }
          break;
        case 'rndfbc':
          // 续费钻粉
          obj = {
            type: '钻粉',
            name: '续费钻粉',
            nn: data.nick,
            lv: data.level,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
          };
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          if (options.value.isSaveData) {
            giftListSave.push(msg);
          }
          break;
        case 'anbc':
          // 开通贵族
          if (data.drid != window.rid) {
            return; // 不在本房间开通则丢弃
          }
          obj = {
            type: '贵族',
            name: '开通' + nobleData[data.nl].name,
            nn: data.unk,
            nl: data.nl, // 贵族等级
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
          };
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          if (options.value.isSaveData) {
            giftListSave.push(msg);
          }
          break;
        case 'rnewbc':
          // 续费贵族
          if (data.drid != window.rid) {
            return; // 不在本房间开通则丢弃
          }
          obj = {
            type: '贵族',
            name: '续费' + nobleData[data.nl].name,
            nn: data.unk,
            nl: data.nl, // 贵族等级
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
          };
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          if (options.value.isSaveData) {
            giftListSave.push(msg);
          }
          break;
        case 'blab':
          // 30级以下粉丝牌升级
          if (data.rid !== window.rid) {
            return; // 不在本房间 则丢弃
          }
          if (!checkFansLevelValid(data.bl)) {
            return;
          }
          obj = {
            type: '粉丝牌升级',
            name: '粉丝牌升到' + String(data.bl) + '级',
            nn: data.nn,
            bl: data.bl,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
          };
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          if (options.value.isSaveData) {
            giftListSave.push(msg);
          }
          break;
        case 'fansupgradebroadcast':
          // 30以上粉丝牌升级
          if (data.rid !== window.rid) {
            return; // 不在本房间 则丢弃
          }
          if (!checkFansLevelValid(data.otherContent)) {
            return;
          }
          obj = {
            type: '粉丝牌升级',
            name: '粉丝牌升到' + String(data.otherContent) + '级',
            nn: data.userName,
            bl: data.otherContent,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
          };
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          if (options.value.isSaveData) {
            giftListSave.push(msg);
          }
          break;
        default:
          break;
      }
    }

    // 进场信息
    if (msgType === 'uenter' && options.value.switch.includes('enter')) {
      let data = stt.deserialize(msg);
      if (!checkEnterValid(data)) {
        return;
      }
      let obj = {
        nn: data.nn,
        avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
        lv: data.level, // 等级
        noble: data.nl, // 贵族等级
        key: new Date().getTime() + Math.random(),
      };
      if (enterList.value.length + 1 > options.value.threshold) {
        enterList.value.shift();
      }
      enterList.value.push(obj);
      if (options.value.isSaveData) {
        enterListSave.push(msg);
      }
    }
  };

  const checkDanmakuValid = data => {
    // 判断屏蔽等级
    if (Number(data.level) <= Number(options.value.danmaku.ban.level)) {
      return false;
    }
    // 判断关键词
    let keywords = options.value.danmaku.ban.keywords
      ? options.value.danmaku.ban.keywords.trim()
      : '';
    if (keywords !== '') {
      let arr = keywords.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== '' && data.txt.indexOf(arr[i]) !== -1) {
          return false;
        }
      }
    }
    // 判断关键昵称
    let nicknames = options.value.danmaku.ban.nicknames
      ? options.value.danmaku.ban.nicknames.trim()
      : '';
    if (nicknames !== '') {
      let arr = nicknames.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== '' && data.nn.indexOf(arr[i]) !== -1) {
          return false;
        }
      }
    }
    // 过滤重复弹幕
    if (options.value.danmaku.ban.isFilterRepeat) {
      if (
        danmakuList.value.length > 0 &&
        danmakuList.value[danmakuList.value.length - 1].txt === data.txt
      ) {
        return false;
      }
    }
    return true;
  };

  const checkGiftValid = data => {
    let giftData = allGiftData.value[data.gfid];
    // 如果礼物数据不存在，直接返回true（不屏蔽）
    if (!giftData) {
      return true;
    }

    // 屏蔽单价
    if (
      giftData.pc &&
      Number(giftData.pc) < Number(options.value.gift.ban.price) * 100
    ) {
      return false;
    }

    // 屏蔽关键词
    let keywords = options.value.gift.ban.keywords
      ? options.value.gift.ban.keywords.trim()
      : '';
    if (keywords !== '' && giftData.n) {
      let giftName = giftData.n;
      let arr = keywords.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== '' && giftName.indexOf(arr[i]) !== -1) {
          return false;
        }
      }
    }
    return true;
  };

  const checkFansLevelValid = level => {
    // 判断屏蔽粉丝牌升级等级
    if (Number(options.value.gift.ban.fansLevel) > Number(level)) {
      return false;
    }
    return true;
  };

  const checkEnterValid = data => {
    // 判断屏蔽等级
    if (Number(data.level) <= Number(options.value.enter.ban.level)) {
      return false;
    }
    return true;
  };

  /**
   * 检查弹幕是否符合指令弹幕规则
   * @param {Object} data - 弹幕数据
   * @returns {Object|null} - 符合规则返回指令弹幕对象，否则返回null
   */
  const checkCommandDanmakuValid = data => {
    // 获取指令弹幕配置
    const { prefix, keywords } = options.value.commandDanmaku;

    // 检查前缀
    if (!data.txt.startsWith(prefix)) {
      return null;
    }

    // 获取前缀后的内容
    const contentAfterPrefix = data.txt.slice(prefix.length);

    // 检查关键词
    const matchedKeyword = keywords.find(
      kw => kw.enabled && contentAfterPrefix.includes(kw.name)
    );
    if (!matchedKeyword) {
      return null;
    }

    // 提取指令内容（去除关键词）
    const commandContent = contentAfterPrefix
      .replace(matchedKeyword.name, '')
      .trim();

    // 构造指令弹幕对象
    return {
      id: data.cid || new Date().getTime() + Math.random(),
      userId: data.uid,
      userName: data.nn,
      userLevel: Number(data.level),
      content: data.txt,
      command: matchedKeyword.name,
      commandContent: commandContent,
      timestamp: Date.now(),
      isExpired: false, // 添加失效状态属性
      userInfo: {
        avatar: data.ic,
        fansLevel: Number(data.bl) || 0,
        nobleLevel: Number(data.nl) || 0,
        isRoomAdmin: data.rg === 4,
      },
    };
  };

  return {
    connectWs,
    danmakuList,
    enterList,
    giftList,
    superchatList,
    commandDanmakuList,
    danmakuListSave,
    enterListSave,
    giftListSave,
    superchatListSave,
    commandDanmakuListSave,
    isConnected,
    reconnectCount,
  };
}
