# 斗鱼弹幕API文档

## 1. 弹幕服务简介

为了避免弹幕获取流量浪费，提高弹幕分发效率，斗鱼提供了以TCP协议为基准的弹幕消息推送服务，整体流程如下：

1. 连接弹幕服务器；
2. 登陆鉴权；
3. 进入房间弹幕频道；
4. 接受弹幕消息（保持心跳）；
5. 断开弹幕连接；

## 2. 弹幕协议

### 2.1 协议组成

受TCP最大传输单元（MTU）限制及连包机制影响，应用层协议需自己设计协议头，以保证不同消息的隔离性和消息完整性。斗鱼后台协议头设计如下：

| 字段 | 长度 | 类型 | 说明 |
|------|------|------|------|
| 消息长度 | 4字节 | 小端整数 | 表示整条消息（包括自身）长度（字节数） |
| 消息长度 | 4字节 | 小端整数 | 与前一个消息长度相同 |
| 消息类型 | 2字节 | 小端整数 | 689：客户端发送给弹幕服务器的文本格式数据<br>690：弹幕服务器发送给客户端的文本格式数据 |
| 加密字段 | 1字节 | 整数 | 暂时未用，默认为0 |
| 保留字段 | 1字节 | 整数 | 暂时未用，默认为0 |
| 数据部分 | 可变 | 文本 | 斗鱼独创序列化文本数据，结尾必须为'\0' |

> 所有协议内容均为UTF-8编码

### 2.2 序列化与反序列化

为增强兼容性、可读性，斗鱼后台通讯协议采用文本形式的明文数据。同时针对本平台数据特点，斗鱼自创序列化、反序列化算法，即STT序列化。

#### STT序列化规则

1. 键key和值value直接采用'@='分割
2. 数组采用'/'分割
3. 如果key或者value中含有字符'/'，则使用'@S'转义
4. 如果key或者value中含有字符'@'，使用'@A'转义

#### 示例

1. 多个键值对数据：
   ```
   key1@=value1/key2@=value2/key3@=value3/
   ```

2. 数组数据：
   ```
   value1/value2/value3/
   ```

3. 包含转义字符的数据：
   ```
   key1@=value1@Svalue2/key2@=value@A3/
   ```

## 3. 客户端消息格式

客户端向弹幕服务器发送消息时，头部消息类型字段为689。

### 3.1 登录请求消息

该消息用于完成登录授权，完整的数据部分应包含的字段如下：

```
type@=loginreq/roomid@=58839/aid@=yihanTest/token@=4c8421535f9639d8c1ad35d1fa421f36/time@=1574850339/auth@=45619bb990e6b76db06a66d5a8a446d7/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"登陆请求"消息，固定为loginreq |
| roomid | 所登录房间的ID |
| aid | 开发平台身份标识ID |
| token | 通过http://openapi.douyu.com/api/thirdPart/token获取的身份凭证 |
| time | 当前时间戳 |
| auth | 鉴权参数，生成方式为md5({secret}_{aid}_{time}_{token})，secret为aid对应的秘钥 |

### 3.2 客户端旧版心跳消息

该消息用于维持与后台间的心跳（旧版），完整的数据部分应包含的字段如下：

```
type@=keeplive/tick@=1439802131/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"心跳"消息，固定为keeplive |
| tick | 当前unix时间戳 |

### 3.3 客户端新版心跳消息

该消息用于维持与后台间的心跳（新版），完整的数据部分应包含的字段如下：

```
type@=mrkl/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"心跳"消息，固定为mrkl |

### 3.4 入组消息

该消息用于完成加入房间分组，完整的数据部分应包含的字段如下：

```
type@=joingroup/rid@=59872/aid@=yourapplicaitonID/token@=4c8421535f9639d8c1ad35d1fa421f36/time@=1574850339/auth@=xxxxxxxxxxxx/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"加入房间分组"消息，固定为joingroup |
| aid | 开发平台身份标识ID |
| rid | 所登录的房间号 |
| token | 获取方式见https://open.douyu.com/source/api/8 |
| time | 当前时间戳 |
| auth | 鉴权参数，生成方式为md5({secret}_{aid}_{time}_{token})，secret为aid对应的秘钥 |

### 3.5 订阅贵族排行变动

该消息用于订阅贵族排行变动消息，完整的数据部分应包含的字段如下：

```
type@=sub/mt@=online_vip_list/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"订阅"消息，固定为sub |
| mt | 消息类型，暂仅支持online_vip_list |

### 3.6 登出消息

该消息用于完成登出后台服务，完整的数据部分应包含的字段如下：

```
type@=logout/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"登出"消息，固定为logout |

## 4. 服务端消息格式

服务端向客户端发送消息时，头部消息类型字段为690。

### 4.1 登录响应消息

服务端返回登陆响应消息，完整的数据部分应包含的字段如下：

```
type@=loginresp/msg@=ok/rid@=77614265/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"登录"消息，固定为loginresp |
| msg | 登录响应 |
| rid | 房间ID |

### 4.2 弹幕消息

用户在房间接收弹幕时，服务端发送此消息给客户端，完整的数据部分应包含的字段如下：

```
type@=chatmsg/rid@=58839/ct@=8/hashid@=9LA18ePx4dqW/nn@=test/txt@=666/cid@=1111/ic@=icon/sahf@=0/level@=1/nl@=0/nc@=0/cmt@=0/gt@=0/col@=0/rg@=0/pg@=0/dlv@=0/dc@=0/bdlv@=0/gatin@=0/chtin@=0/repin@=0/bnn@=test/bl@=0/brid@=58839/hc@=0/ol@=0/rev@=0/hl@=0/ifs@=0/p2p@=0/el@=eid@AA=1@ASetp@AA=1@ASsc@AA=1@AS/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"弹幕"消息，固定为chatmsg |
| rid | 房间id |
| hashid | 发送者uid |
| nn | 发送者昵称 |
| txt | 弹幕文本内容 |
| level | 用户等级 |
| gt | 礼物头衔：默认值0（表示没有头衔） |
| col | 颜色：默认值0（表示默认颜色弹幕） |
| ct | 客户端类型：默认值0 |
| rg | 房间权限组：默认值1（表示普通权限用户） |
| pg | 平台权限组：默认值1（表示普通权限用户） |
| dlv | 酬勤等级：默认值0（表示没有酬勤） |
| dc | 酬勤数量：默认值0（表示没有酬勤数量） |
| bdlv | 最高酬勤等级：默认值0（表示全站都没有酬勤） |
| cmt | 弹幕具体类型: 默认值0（普通弹幕） |
| sahf | 扩展字段，一般不使用，可忽略 |
| ic | 用户头像 |
| nl | 贵族等级 |
| nc | 贵族弹幕标识,0-非贵族弹幕,1-贵族弹幕,默认值0 |
| gatin | 进入网关服务时间戳 |
| chtin | 进入房间服务时间戳 |
| repin | 进入发送服务时间戳 |
| bnn | 徽章昵称 |
| bl | 徽章等级 |
| brid | 徽章房间id |
| hc | 徽章信息校验码 |
| ol | 主播等级 |
| rev | 是否反向弹幕标记: 0-普通弹幕，1-反向弹幕, 默认值0 |
| hl | 是否高亮弹幕标记: 0-普通，1-高亮, 默认值0 |
| ifs | 是否粉丝弹幕标记: 0-非粉丝弹幕，1-粉丝弹幕, 默认值0 |
| p2p | 服务功能字段 |
| el | 用户获得的连击特效：数组类型，数组包含eid（特效id）,etp（特效类型）,sc（特效次数）信息，ef（特效标志） |

### 4.3 礼物消息

用户在房间赠送礼物时，服务端发送此消息给客户端，完整的数据部分应包含的字段如下：

```
type@=dgb/gfid@=1/gs@=59872/gfcnt@=1/hashid@=1/rid@=1/nn@=someone/level@=1/dw@=1/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"赠送礼物"消息，固定为dgb |
| rid | 房间ID |
| gid | 弹幕分组ID |
| gfid | 礼物id |
| gs | 礼物显示样式 |
| hashid | 用户id |
| nn | 用户昵称 |
| bg | 大礼物标识：默认值为0（表示是小礼物） |
| ic | 用户头像 |
| eid | 礼物关联的特效id |
| level | 用户等级 |
| dw | 主播体重 |
| gfcnt | 礼物个数：默认值1（表示1个礼物） |
| hits | 礼物连击次数：默认值1（表示1连击） |
| dlv | 酬勤头衔：默认值0（表示没有酬勤） |
| dc | 酬勤个数：默认值0（表示没有酬勤数量） |
| bdl | 全站最高酬勤等级：默认值0（表示全站都没有酬勤） |
| rg | 房间身份组：默认值1（表示普通权限用户） |
| pg | 平台身份组：默认值1（表示普通权限用户） |
| nl | 贵族等级：默认值0（表示不是贵族） |
| sahf | 扩展字段，一般不使用，可忽略 |
| bnn | 徽章昵称 |
| bl | 徽章等级 |
| brid | 徽章房间id |
| hc | 徽章信息校验码 |
| fc | 攻击道具的攻击力 |

### 4.4 用户进房通知消息

具有特殊属性的用户进入直播间时，服务端发送此消息至客户端，完整的数据部分应包含的字段如下：

```
type@=uenter/rid@=1/uid@=1/nn@=someone/str@=1/level@=1/el@=eid@AA=1@ASetp@AA=1@ASsc@AA=1@AS@S/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"用户进房通知"消息，固定为uenter |
| rid | 房间ID |
| uid | 用户ID |
| nn | 用户昵称 |
| str | 战斗力 |
| level | 新用户等级 |
| gt | 礼物头衔：默认值0（表示没有头衔） |
| rg | 房间权限组：默认值1（表示普通权限用户） |
| pg | 平台身份组：默认值1（表示普通权限用户） |
| dlv | 酬勤等级：默认值0（表示没有酬勤） |
| dc | 酬勤数量：默认值0（表示没有酬勤数量） |
| bdlv | 最高酬勤等级：默认值0 |
| ic | 用户头像 |
| nl | 贵族等级 |
| ceid | 扩展功能字段id |
| crw | 用户栏目上周排名 |
| ol | 主播等级 |
| el | 用户获得的连击特效：数组类型，数组包含eid（特效id）,etp（特效类型）,sc（特效次数）信息，ef（特效标志） |

### 4.5 房间开关播提醒

房间开播提醒主要部分应包含的字段如下：

```
type@=rss/rid@=1/ss@=1/code@=1/rt@=0/notify@=1/endtime@=1/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"房间开关播提醒"消息，固定为rss |
| rid | 房间ID |
| ss | 房间状态，1为开播，0为关播 |
| code | 状态码 |
| rt | 房间类型 |
| notify | 是否通知 |
| endtime | 关播时间戳 |

### 4.6 礼物连击消息

用户在房间赠送礼物时，可能会触发连击效果，服务端发送此消息给客户端，完整的数据部分应包含的字段如下：

```
type@=hit/gfid@=1/gs@=59872/gfcnt@=1/hashid@=1/rid@=1/nn@=someone/level@=1/dw@=1/hits@=5/
```

| 字段名 | 字段说明 |
|--------|----------|
| type | 表示为"礼物连击"消息，固定为hit |
| rid | 房间ID |
| gfid | 礼物id |
| gs | 礼物显示样式 |
| hashid | 用户id |
| nn | 用户昵称 |
| level | 用户等级 |
| dw | 主播体重 |
| gfcnt | 礼物个数 |
| hits | 连击次数 |

## 5. 常见问题与解决方案

### 5.1 连接失败

**问题**：无法连接到斗鱼弹幕服务器。

**解决方案**：
- 检查网络连接是否正常
- 确认房间ID是否正确
- 检查aid和token是否有效
- 尝试使用不同的弹幕服务器地址

### 5.2 心跳失败

**问题**：连接后不久就断开，提示心跳失败。

**解决方案**：
- 确保每45秒发送一次心跳消息
- 使用新版心跳消息格式：`type@=mrkl/`
- 检查网络稳定性

### 5.3 弹幕解析失败

**问题**：接收到的弹幕消息解析失败。

**解决方案**：
- 确保正确实现STT序列化和反序列化算法
- 处理好消息的边界，确保完整接收每条消息
- 注意转义字符的处理
- 对于复杂的嵌套结构，使用递归解析

### 5.4 权限不足

**问题**：无法接收某些类型的消息，如礼物消息。

**解决方案**：
- 在斗鱼开放平台申请相应的权限
- 确保aid和token具有足够的权限

## 6. 代码示例

### 6.1 基本连接示例

```javascript
const net = require('net');

// 弹幕服务器地址
const SERVER_HOST = 'openbarrage.douyutv.com';
const SERVER_PORT = 8601;

// 房间ID
const ROOM_ID = '58839';

// 连接弹幕服务器
const client = net.connect({ host: SERVER_HOST, port: SERVER_PORT }, () => {
  console.log('Connected to danmaku server');
  
  // 发送登录请求
  const loginMsg = createMessage('type@=loginreq/roomid@=' + ROOM_ID + '/');
  client.write(loginMsg);
});

// 创建消息
function createMessage(data) {
  const msg = Buffer.from(data + '\0', 'utf8');
  const length = msg.length + 8;
  const buffer = Buffer.alloc(length);
  
  // 写入消息长度
  buffer.writeUInt32LE(length - 4, 0);
  buffer.writeUInt32LE(length - 4, 4);
  // 写入消息类型
  buffer.writeUInt16LE(689, 8);
  // 写入加密字段和保留字段
  buffer.writeUInt8(0, 10);
  buffer.writeUInt8(0, 11);
  // 写入数据部分
  msg.copy(buffer, 12);
  
  return buffer;
}

// 接收消息
client.on('data', (data) => {
  // 解析消息
  parseMessage(data);
});

// 解析消息
function parseMessage(data) {
  let offset = 0;
  
  while (offset < data.length) {
    // 读取消息长度
    const length = data.readUInt32LE(offset);
    if (length === 0) break;
    
    // 读取消息类型
    const type = data.readUInt16LE(offset + 8);
    
    // 读取数据部分
    const content = data.toString('utf8', offset + 12, offset + length + 4).replace('\0', '');
    
    // 处理消息
    if (type === 690) {
      console.log('Received message:', content);
      // 解析具体消息
      parseDanmakuMessage(content);
    }
    
    // 移动偏移量
    offset += length + 4;
  }
}

// 解析弹幕消息
function parseDanmakuMessage(content) {
  const msgType = content.split('/')[0].split('@=')[1];
  
  switch (msgType) {
    case 'loginresp':
      console.log('Login response:', content);
      // 登录成功后进入房间
      const joinGroupMsg = createMessage('type@=joingroup/rid@=' + ROOM_ID + '/');
      client.write(joinGroupMsg);
      break;
    case 'chatmsg':
      console.log('Chat message:', content);
      break;
    case 'dgb':
      console.log('Gift message:', content);
      break;
    default:
      break;
  }
}

// 定时发送心跳
setInterval(() => {
  const heartbeatMsg = createMessage('type@=mrkl/');
  client.write(heartbeatMsg);
  console.log('Sent heartbeat');
}, 45000);

// 连接关闭
client.on('end', () => {
  console.log('Disconnected from danmaku server');
});

// 连接错误
client.on('error', (err) => {
  console.error('Error:', err);
});
```

### 6.2 STT序列化与反序列化示例

```javascript
// STT序列化
function serialize(data) {
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).map(key => {
      const value = serialize(data[key]);
      return `${key}@=${escapeSTT(value)}`;
    }).join('/') + '/';
  } else if (Array.isArray(data)) {
    return data.map(item => escapeSTT(serialize(item))).join('/') + '/';
  } else {
    return String(data);
  }
}

// STT反序列化
function deserialize(data) {
  if (!data) return null;
  
  if (data.includes('@=')) {
    return data.split('/').filter(item => item !== '').reduce((obj, item) => {
      const [key, value] = item.split('@=');
      obj[key] = deserialize(unescapeSTT(value));
      return obj;
    }, {});
  } else {
    return unescapeSTT(data);
  }
}

// 转义STT特殊字符
function escapeSTT(str) {
  return String(str).replace(/@/g, '@A').replace(/\//g, '@S');
}

// 反转义STT特殊字符
function unescapeSTT(str) {
  return String(str).replace(/@A/g, '@').replace(/@S/g, '/');
}
```

## 7. 注意事项

1. **网络稳定性**：由于弹幕服务依赖网络连接，确保网络稳定是接收弹幕的关键。

2. **心跳机制**：必须每45秒发送一次心跳消息，否则连接会被服务器断开。

3. **消息边界**：TCP是流协议，需要自己处理消息的边界，确保完整接收每条消息。

4. **权限申请**：某些类型的消息（如礼物消息）需要在斗鱼开放平台申请相应的权限。

5. **速率限制**：斗鱼对API调用有速率限制，请勿频繁发送请求。

6. **HTTPS迁移**：斗鱼开放平台将于1月30日开始将所有接口中返回的http地址调整为https，开发者需要提前做好兼容。

7. **错误处理**：实现完善的错误处理机制，确保程序在遇到异常时能够正常运行。

## 8. 参考资料

- [斗鱼开放平台](https://open.douyu.com/)
- [斗鱼弹幕API文档](https://open.douyu.com/source/api/63)
- [斗鱼开放平台开发者协议](https://www.douyu.com/cms/gong/201912/18/11943.shtml)
