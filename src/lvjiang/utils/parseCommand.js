/**
 * 驴酱青春团 · 指令弹幕解析（纯函数）
 * 支持：#给{团员名}{温度值} / #炸{团员名}{温度值}
 */

// 指令前缀 → 类型映射
const COMMAND_PREFIXES = [
  { prefix: '#给', type: 'give' },
  { prefix: '#炸', type: 'bomb' },
];

// 末尾温度值（含小数）
const TRAILING_VALUE = /(\d+(?:\.\d+)?)$/;

/**
 * 归一化团员名单：去空、去重、按长度降序（保证最长昵称优先匹配）
 * @param {Array} members - 团员名单
 * @returns {string[]} 归一化后的名单
 */
function normalizeMembers(members) {
  if (!Array.isArray(members)) return [];
  const seen = new Set();
  const list = [];
  members.forEach(item => {
    const name = String(item == null ? '' : item).trim();
    if (name === '' || seen.has(name)) return;
    seen.add(name);
    list.push(name);
  });
  return list.sort((a, b) => b.length - a.length);
}

/**
 * 将「团员名 + 温度值」文本切分为结构化结果
 * 优先级：① 团员名单优先匹配（最长昵称优先，其后须为可选空格+数字）
 *        ② 通用回退（末尾连续数字为温度值，其余为团员名）
 *        ③ 解析失败返回 null
 * @param {string} segment - 待切分文本（不含指令前缀）
 * @param {Array} members - 团员名单（用于消歧）
 * @returns {{member: string, value: number}|null}
 */
export function splitMemberAndValue(segment, members) {
  const text = String(segment == null ? '' : segment).trim();
  if (text === '') return null;

  // ① 团员名单优先匹配
  for (const name of normalizeMembers(members)) {
    if (!text.startsWith(name)) continue;
    const rest = text.slice(name.length);
    if (/^\s*\d+(?:\.\d+)?$/.test(rest)) {
      return { member: name, value: Number(rest.trim()) };
    }
  }

  // ② 通用回退解析
  const matched = text.match(TRAILING_VALUE);
  if (matched) {
    const member = text.slice(0, matched.index).trim();
    if (member !== '') {
      return { member, value: Number(matched[1]) };
    }
  }

  // ③ 解析失败
  return null;
}

/**
 * 解析指令弹幕
 * @param {string} text - 弹幕原文
 * @param {Array} members - 团员名单（用于消歧）
 * @returns {{type: 'give'|'bomb', member: string, value: number}|null}
 */
export function parseCommand(text, members) {
  const raw = String(text == null ? '' : text).trim();
  if (raw === '') return null;

  const hit = COMMAND_PREFIXES.find(item => raw.startsWith(item.prefix));
  if (!hit) return null;

  const rest = raw.slice(hit.prefix.length);
  const parsed = splitMemberAndValue(rest, members);
  if (!parsed) return null;

  return { type: hit.type, member: parsed.member, value: parsed.value };
}
