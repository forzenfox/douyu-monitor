const { STT } = require('./src/global/utils/stt.js');

// 模拟 parseChatmsg 函数
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

// 测试数据
const testData =
  'vrid@=2013528989938757632/btype@=voiceDanmu/chatmsg@=nn@A=被封号依旧支持余凯洞@Sbnn@A=雨酱灬@Slevel@A=44@Sbrid@A=317422@Sail@A=2614@AS1446@AS917@AS3688@AS@Sbl@A=21@Stype@A=chatmsg@Srid@A=317422@Sgag@A=0@Suid@A=13135382@Stxt@A=加菜，拍个黄瓜+来点花生米@Sadid@A=0@Shidenick@A=0@Snc@A=0@Sifs@A=1@Sic@A=avatar_v3@AS202105@AS72476ba446bf476fa3d63897ab98a572@Snl@A=0@Stbid@A=0@Stbl@A=0@Stbvip@A=0@S/range@=2/cprice@=1000/crealPrice@=1000/cmgType@=1/type@=comm_chatmsg/rid@=317422/gbtemp@=2/uid@=13135382/cet@=30/now@=1768897734068/csuperScreen@=0/danmucr@=1/';

// 创建 STT 实例
const stt = new STT();

// 解析测试数据
const parsedData = stt.deserialize(testData);
console.log('解析后的数据:', parsedData);

// 测试 parseChatmsg 函数
const chatmsg = parsedData.chatmsg;
console.log('chatmsg 类型:', typeof chatmsg);
console.log('chatmsg 内容:', chatmsg);

const parsedChatmsg = parseChatmsg(chatmsg);
console.log('parseChatmsg 结果:', parsedChatmsg);

// 检查关键字段是否解析正确
console.log('\n关键字段检查:');
console.log('昵称 (nn):', parsedChatmsg.nn);
console.log('内容 (txt):', parsedChatmsg.txt);
console.log('头像 (ic):', parsedChatmsg.ic);

// 验证修复是否成功
if (parsedChatmsg.nn && parsedChatmsg.txt && parsedChatmsg.ic) {
  console.log('\n✓ 修复成功！超级弹幕解析正常。');
} else {
  console.log('\n✗ 修复失败！超级弹幕解析仍然有问题。');
}
