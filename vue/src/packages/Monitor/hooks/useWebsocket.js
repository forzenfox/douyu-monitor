import { ref } from "vue";
import { Ex_WebSocket_UnLogin } from "@/global/utils/websocket.js"
import { STT } from "@/global/utils/stt.js"
import { getStrMiddle } from "@/global/utils"
import { nobleData } from "@/global/utils/dydata/nobleData.js"
import { speakText } from "@/global/utils/speak.js"

export function useWebsocket(options, allGiftData) {
    let ws = null;
    let stt = new STT();
    let danmakuList = ref([]);
    let enterList = ref([]);
    let giftList = ref([]);
    let superchatList = ref([]);
    let commandDanmakuList = ref([]);

    let danmakuListSave = [];
    let enterListSave = [];
    let giftListSave = [];
    let superchatListSave = [];
    let commandDanmakuListSave = [];
    
    // 超级弹幕映射表，用于存储用户的礼物贡献
    let superchatMap = {};
    
    // 超级弹幕过期清理定时器
    let superchatCleanupTimer = null;

    /**
     * 更新超级弹幕的过期状态
     */
    const updateSuperchatExpireStatus = () => {
        if (superchatList.value.length === 0) return;
        
        const now = Date.now();
        console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 开始更新超级弹幕过期状态，当前列表长度：${superchatList.value.length}`);
        
        superchatList.value.forEach((item, index) => {
            // 默认超级弹幕配置
            const superchatOption = {
                time: 10,
                bgColor: {
                    header: "rgb(208,0,0)",
                    body: "rgb(230,33,23)"
                }
            };
            
            // 检查是否过期，并标记状态
            // 使用配置中的time字段作为过期时长（单位：秒）
            const expireTime = item.createdAt + superchatOption.time * 1000;
            const wasExpired = item.isExpired;
            item.isExpired = expireTime < now;
            
            if (item.isExpired !== wasExpired) {
                console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 超级弹幕 ${index + 1} 过期状态变化：${wasExpired ? '过期' : '未过期'} -> ${item.isExpired ? '过期' : '未过期'}`);
            }
        });
        
        console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 超级弹幕过期状态更新完成，当前过期数量：${superchatList.value.filter(item => item.isExpired).length}`);
    };

    /**
     * Mock生成超级弹幕
     */
    /* const mockSuperchat = () => {
        // 生成一条测试超级弹幕
        const testData = {
            nn: "测试用户",
            ic: "avatar_v3/202105/7b4b257d45c74deab9ff4e57746fd8a5",
            txt: `这是一条测试超级弹幕 ${Date.now()}`,
            cid: Date.now().toString()
        };
        
        const price = Math.floor(Math.random() * 1000) + 10; // 10-209随机价格
        const superchat = generateSuperchat(testData, price);
        
        if (superchatList.value.length + 1 > options.value.threshold) {
            superchatList.value.shift();
        }
        superchatList.value.push(superchat);
        
        console.log(`[Mock] 生成了一条测试超级弹幕，价格：${price}，当前列表长度：${superchatList.value.length}`);
    }; */

    const connectWs = (rid) => {
        if (rid === "") {
            return;
        }
        
        // 清理旧的WebSocket和定时器
        if (ws) {
            ws.close();
            ws = null;
        }
        if (superchatCleanupTimer) {
            clearInterval(superchatCleanupTimer);
            superchatCleanupTimer = null;
        }
        
        /* // 开发环境下使用mock数据（自动调试）
        if (import.meta.env.DEV) {
            console.log("[Mock] 开发环境下使用自动Mock功能");
            
            // 每3秒生成一条测试超级弹幕
            const mockInterval = setInterval(mockSuperchat, 3000);
            
            // 启动超级弹幕过期状态更新定时器
            superchatCleanupTimer = setInterval(() => {
                updateSuperchatExpireStatus();
            }, 1000);
            
            // 清理函数
            return () => {
                clearInterval(mockInterval);
                if (superchatCleanupTimer) {
                    clearInterval(superchatCleanupTimer);
                }
            };
        } */
        
        ws = new Ex_WebSocket_UnLogin(rid, (msg) => {
            handleMsg(msg);
        }, () => {
            // 重连
            ws.close();
            ws = null;
            connectWs(rid);
        });
        
        // 启动超级弹幕过期状态更新定时器
        superchatCleanupTimer = setInterval(updateSuperchatExpireStatus, 1000);
    }

    /**
     * 生成超级弹幕
     * @param {Object} data - 消息数据
     * @param {number} price - 超级弹幕价格
     * @returns {Object} 超级弹幕对象
     */
    const generateSuperchat = (data, price) => {
        console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 开始生成超级弹幕，用户：${data.nn || data.userName || '匿名用户'}，价格：${price}，原始数据：`, data);
        
        // 默认超级弹幕配置
        const superchatOption = {
            time: 10,
            bgColor: {
                header: "rgb(208,0,0)",
                body: "rgb(230,33,23)"
            }
        };
        
        console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 最终使用的超级弹幕配置：`, superchatOption);

        // 根据价格确定超级弹幕等级
        let level = 1;
        if (price >= 0) {
            // 根据价格区间确定等级
            if (price >= 1000) level = 6;
            else if (price >= 500) level = 5;
            else if (price >= 100) level = 4;
            else if (price >= 50) level = 3;
            else if (price >= 30) level = 2;
            else level = 1;
        } else {
            // 负数价格使用最低等级
            level = 1;
        }
        
        console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 计算出的超级弹幕等级：${level}`);

        const superchat = {
            nn: data.nn || data.userName || "匿名用户", // 昵称，确保有默认值
            avatar: data.ic || data.avatar || "", // 头像地址
            txt: data.txt || "", // 弹幕内容，确保有默认值
            price: price, // 价格
            level: level, // 等级
            bgColor: superchatOption.bgColor, // 使用配置中的bgColor对象
            textColor: '#FFFFFF', // 默认文字颜色为白色
            nicknameColor: '#FFFFFF', // 默认昵称颜色为白色
            key: data.cid || (new Date().getTime() + Math.random()), // 唯一标识
            createdAt: Date.now(), // 创建时间
            isExpired: false
        };
        
        console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 生成的超级弹幕对象：`, superchat);
        return superchat;
    };

    const handleMsg = (msg) => {
        let msgType = getStrMiddle(msg, "type@=", "/");
        if (!msgType) {
            return;
        }
        
        console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 接收到消息，类型：${msgType}`);
        
        // 处理普通弹幕
        if (msgType === "chatmsg" && options.value.switch.includes("danmaku")) {
            let data = stt.deserialize(msg);
            // 超管弹幕
            if (!checkDanmakuValid(data)) {
                return;
            }

            // 检查是否有超级弹幕关键词
            const hasSuperchatKeyword = data.txt.includes(options.value.superchat.keyword);
            
            // 检查用户是否有足够的礼物贡献
            const superchatData = superchatMap[data.uid];
            
            console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 普通弹幕处理，用户：${data.nn}，内容：${data.txt}`);
            console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 包含超级弹幕关键词：${hasSuperchatKeyword}，用户礼物贡献：`, superchatData);
            
            // 取消权限限制，所有用户都可以发送超级弹幕
            if (hasSuperchatKeyword && superchatData && superchatData.count >= 1 && options.value.switch.includes("superchat")) {
                console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 普通弹幕触发超级弹幕生成`);
                // 生成超级弹幕
                const superchat = generateSuperchat(data, superchatData.price);
                
                if (superchatList.value.length + 1 > options.value.threshold) {
                    console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 超级弹幕列表超过阈值，移除最早的一条`);
                    superchatList.value.shift();
                }
                superchatList.value.push(superchat);
                console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 超级弹幕添加到列表，当前长度：${superchatList.value.length}`);
                
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
                    vip: data.ail == "453/" || data.ail == "454/", // vip，如果是 453/则为vip  454/则为超级vip
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
                if (commandDanmaku && options.value.switch.includes("commandDanmaku")) {
                    if (commandDanmakuList.value.length + 1 > options.value.threshold) {
                        commandDanmakuList.value.shift();
                    }
                    commandDanmakuList.value.push(commandDanmaku);
                    if (options.value.isSaveData) {
                        commandDanmakuListSave.push(msg);
                    }
                }
            }
        }
        
        // 处理真实超级弹幕消息类型
        if ((msgType === "sc" || msgType === "superchat" || msgType === "fansPaper" || msgType === "professgiftsrc" || msgType === "voiceDanmu") && options.value.switch.includes("superchat")) {
            console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 接收到超级弹幕消息，类型：${msgType}`);
            let data = stt.deserialize(msg);
            
            let price = 10; // 默认价格
            let txt = "";
            
            // 根据不同消息类型处理
            switch (msgType) {
                case "sc":
                case "superchat":
                    // 标准超级弹幕消息
                    price = data.price || data.cost || 10;
                    txt = data.txt || data.msg || "";
                    console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 标准超级弹幕，价格：${price}，内容：${txt}`);
                    break;
                    
                case "fansPaper":
                    // 粉丝牌弹幕
                    // 根据文本级别计算价格（负值）
                    price = data.textLevel || -1;
                    txt = data.txt || "";
                    console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 粉丝牌弹幕，文本级别：${price}，内容：${txt}`);
                    break;
                    
                case "professgiftsrc":
                    // 专业礼物弹幕
                    // 固定价格级别
                    price = -3;
                    txt = data.txt || "";
                    console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 专业礼物弹幕，价格：${price}，内容：${txt}`);
                    break;
                    
                case "voiceDanmu":
                    // 语音弹幕
                    // 基于语音价格计算
                    price = data.cprice ? Number(data.cprice) / 100 : 10;
                    txt = data.txt || "";
                    console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 语音弹幕，原始价格：${data.cprice}，转换后：${price}，内容：${txt}`);
                    break;
            }
            
            // 生成超级弹幕
            const superchat = generateSuperchat({
                ...data,
                txt: txt,
                nn: data.nn || data.userName || "匿名用户",
                avatar: data.ic || data.avatar || "",
                uid: data.uid || data.userId || Math.random().toString(36).substr(2, 9)
            }, price);
            
            if (superchatList.value.length + 1 > options.value.threshold) {
                console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 超级弹幕列表超过阈值，移除最早的一条`);
                superchatList.value.shift();
            }
            superchatList.value.push(superchat);
            console.log(`[Superchat] [${new Date().toLocaleTimeString()}] 超级弹幕添加到列表，当前长度：${superchatList.value.length}`);
            
            // 语音播报
            if (options.value.superchat.speak) {
                const userName = data.nn || data.userName || "匿名用户";
                speakText(`${userName}说：${txt}`);
            }
            
            if (options.value.isSaveData) {
                superchatListSave.push(msg);
            }
        }
        
        if ((["dgb", "odfbc", "rndfbc", "anbc", "rnewbc", "blab", "fansupgradebroadcast"].includes(msgType)) && options.value.switch.includes("gift")) {
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
                case "dgb":
                    // 正常礼物
                    if (!checkGiftValid(data)) {
                        return;
                    }
                    obj = {
                        type: "礼物",
                        nn: data.nn, // 昵称
                        lv: data.level, // 等级
                        gfid: data.gfid, // 礼物id 获取名字：allGiftData[item.gfid].n
                        gfcnt: data.gfcnt, // 礼物数量
                        hits: data.hits, // 连击
                        key: new Date().getTime() + Math.random(),
                    }
                    if (giftList.value.length + 1 > options.value.threshold) {
                        giftList.value.shift();
                    }
                    giftList.value.push(obj);
                    if (options.value.isSaveData) {
                        giftListSave.push(msg);
                    }
                    
                    // 检查是否满足超级弹幕条件
                    if (options.value.switch.includes("superchat")) {
                        const giftData = allGiftData.value[data.gfid];
                        if (giftData) {
                            // 计算礼物总价值（单位：元）
                            const totalGiftPrice = Number(data.gfcnt) * Number(giftData.pc) / 100;
                            // 获取最低超级弹幕价格，确保options.value.superchat.options存在
                            const superchatOptions = options.value?.superchat?.options || [];
                            const superchatMinPrice = superchatOptions[superchatOptions.length - 1]?.minPrice;
                            
                            if (totalGiftPrice >= superchatMinPrice) {
                                // 添加到超级弹幕映射表
                                superchatMap[data.uid] = {
                                    count: 1,
                                    price: totalGiftPrice
                                };
                            }
                        }
                    }
                    break;
                case "odfbc":
                    // 开通钻粉
                    obj = {
                        type: "钻粉",
                        name: "开通钻粉",
                        nn: data.nick,
                        lv: data.level,
                        gfid: "0",
                        gfcnt: "1",
                        hits: "1",
                        key: new Date().getTime() + Math.random(),
                    }
                    if (giftList.value.length + 1 > options.value.threshold) {
                        giftList.value.shift();
                    }
                    giftList.value.push(obj);
                    if (options.value.isSaveData) {
                        giftListSave.push(msg);
                    }
                    break;
                case "rndfbc":
                    // 续费钻粉
                    obj = {
                        type: "钻粉",
                        name: "续费钻粉",
                        nn: data.nick,
                        lv: data.level,
                        gfid: "0",
                        gfcnt: "1",
                        hits: "1",
                        key: new Date().getTime() + Math.random(),
                    }
                    if (giftList.value.length + 1 > options.value.threshold) {
                        giftList.value.shift();
                    }
                    giftList.value.push(obj);
                    if (options.value.isSaveData) {
                        giftListSave.push(msg);
                    }
                    break;
                case "anbc":
                    // 开通贵族
                    if (data.drid != window.rid) {
                        return; // 不在本房间开通则丢弃
                    }
                    obj = {
                        type: "贵族",
                        name: "开通" + nobleData[data.nl].name,
                        nn: data.unk,
                        nl: data.nl, // 贵族等级
                        gfid: "0",
                        gfcnt: "1",
                        hits: "1",
                        key: new Date().getTime() + Math.random(),
                    }
                    if (giftList.value.length + 1 > options.value.threshold) {
                        giftList.value.shift();
                    }
                    giftList.value.push(obj);
                    if (options.value.isSaveData) {
                        giftListSave.push(msg);
                    }
                    break;
                case "rnewbc":
                    // 续费贵族
                    if (data.drid != window.rid) {
                        return; // 不在本房间开通则丢弃
                    }
                    obj = {
                        type: "贵族",
                        name: "续费" + nobleData[data.nl].name,
                        nn: data.unk,
                        nl: data.nl, // 贵族等级
                        gfid: "0",
                        gfcnt: "1",
                        hits: "1",
                        key: new Date().getTime() + Math.random(),
                    }
                    if (giftList.value.length + 1 > options.value.threshold) {
                        giftList.value.shift();
                    }
                    giftList.value.push(obj);
                    if (options.value.isSaveData) {
                        giftListSave.push(msg);
                    }
                    break;
                case "blab":
                    // 30级以下粉丝牌升级
                    if (data.rid !== window.rid) {
                        return; // 不在本房间 则丢弃
                    }
                    if (!checkFansLevelValid(data.bl)) {
                        return;
                    }
                    obj = {
                        type: "粉丝牌升级",
                        name: "粉丝牌升到" + String(data.bl) + "级",
                        nn: data.nn,
                        bl: data.bl,
                        gfid: "0",
                        gfcnt: "1",
                        hits: "1",
                        key: new Date().getTime() + Math.random(),
                    }
                    if (giftList.value.length + 1 > options.value.threshold) {
                        giftList.value.shift();
                    }
                    giftList.value.push(obj);
                    if (options.value.isSaveData) {
                        giftListSave.push(msg);
                    }
                    break;
                case "fansupgradebroadcast":
                    // 30以上粉丝牌升级
                    if (data.rid !== window.rid) {
                        return; // 不在本房间 则丢弃
                    }
                    if (!checkFansLevelValid(data.otherContent)) {
                        return;
                    }
                    obj = {
                        type: "粉丝牌升级",
                        name: "粉丝牌升到" + String(data.otherContent) + "级",
                        nn: data.userName,
                        bl: data.otherContent,
                        gfid: "0",
                        gfcnt: "1",
                        hits: "1",
                        key: new Date().getTime() + Math.random(),
                    }
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
        if (msgType === "uenter" && options.value.switch.includes("enter")) {
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
            }
            if (enterList.value.length + 1 > options.value.threshold) {
                enterList.value.shift();
            }
            enterList.value.push(obj);
            if (options.value.isSaveData) {
                enterListSave.push(msg);
            }
        }
    }

    const checkDanmakuValid = (data) => {
        // 判断屏蔽等级
        if (Number(data.level) <= Number(options.value.danmaku.ban.level)) {
            return false;
        }
        // 判断关键词
        let keywords = options.value.danmaku.ban.keywords ? options.value.danmaku.ban.keywords.trim() : "";
        if (keywords !== "") {
            let arr = keywords.split(" ");
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== "" && data.txt.indexOf(arr[i]) !== -1) {
                    return false;
                }
            }
        }
        // 判断关键昵称
        let nicknames = options.value.danmaku.ban.nicknames ? options.value.danmaku.ban.nicknames.trim() : "";
        if (nicknames !== "") {
            let arr = nicknames.split(" ");
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== "" && data.nn.indexOf(arr[i]) !== -1) {
                    return false;
                }
            }
        }
        // 过滤重复弹幕
        if (options.value.danmaku.ban.isFilterRepeat) {
            if (danmakuList.value.length > 0 && danmakuList.value[danmakuList.value.length - 1].txt === data.txt) {
                return false;
            }
        }
        return true;
    }

    const checkGiftValid = (data) => {
        let giftData = allGiftData.value[data.gfid];
        // 如果礼物数据不存在，直接返回true（不屏蔽）
        if (!giftData) {
            return true;
        }
        
        // 屏蔽单价
        if (giftData.pc && Number(giftData.pc) < Number(options.value.gift.ban.price) * 100) {
            return false;
        }

        // 屏蔽关键词
        let keywords = options.value.gift.ban.keywords ? options.value.gift.ban.keywords.trim() : "";
        if (keywords !== "" && giftData.n) {
            let giftName = giftData.n;
            let arr = keywords.split(" ");
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== "" && giftName.indexOf(arr[i]) !== -1) {
                    return false;
                }
            }
        }
        return true;
    }

    const checkFansLevelValid = (level) => {
        // 判断屏蔽粉丝牌升级等级
        if (Number(options.value.gift.ban.fansLevel) > Number(level)) {
            return false;
        }
        return true;
    }

    const checkEnterValid = (data) => {
        // 判断屏蔽等级
        if (Number(data.level) <= Number(options.value.enter.ban.level)) {
            return false;
        }
        return true;
    }

    /**
     * 检查弹幕是否符合指令弹幕规则
     * @param {Object} data - 弹幕数据
     * @returns {Object|null} - 符合规则返回指令弹幕对象，否则返回null
     */
    const checkCommandDanmakuValid = (data) => {
        // 检查指令弹幕模块是否启用
        if (!options.value.commandDanmaku?.enabled) {
            return null;
        }

        // 获取指令弹幕配置
        const { prefix, keywords } = options.value.commandDanmaku;
        
        // 检查前缀
        if (!data.txt.startsWith(prefix)) {
            return null;
        }

        // 获取前缀后的内容
        const contentAfterPrefix = data.txt.slice(prefix.length);
        
        // 检查关键词
        const matchedKeyword = keywords.find(kw => kw.enabled && contentAfterPrefix.includes(kw.name));
        if (!matchedKeyword) {
            return null;
        }

        // 提取指令内容（去除关键词）
        const commandContent = contentAfterPrefix.replace(matchedKeyword.name, '').trim();

        // 构造指令弹幕对象
        return {
            id: data.cid || (new Date().getTime() + Math.random()),
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
                isRoomAdmin: data.rg === 4
            }
        };
    }

    return { connectWs, danmakuList, enterList, giftList, superchatList, commandDanmakuList, danmakuListSave, enterListSave, giftListSave, superchatListSave, commandDanmakuListSave }
}