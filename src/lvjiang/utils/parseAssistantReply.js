/**
 * 驴酱青春团 · 小助手确认回复解析（纯函数）
 * 支持样例：
 *   @我松洞了，转给豆包2000温度值，剩余1533.4温度值
 *   @新驴酱丶张顺飞，炸白晶晶1温度值，剩余0.5温度值
 *   回复@我松洞了：转给豆包2000温度值，剩余1533.4温度值
 */
import { splitMemberAndValue } from './parseCommand.js';

// 老板昵称与后文之间的分隔符（中英文逗号/冒号）
const BOSS_DELIMITER = /[，,：:]/;
// 剩余额度
const REMAINING_PATTERN = /剩余\s*(\d+(?:\.\d+)?)/;

/**
 * 解析小助手确认回复
 * @param {string} text - 回复弹幕原文
 * @param {Array} members - 团员名单（用于消歧）
 * @returns {{boss: string, type: 'give'|'bomb', member: string|null, value: number|null, remaining: number}|null}
 */
export function parseAssistantReply(text, members) {
  const raw = String(text == null ? '' : text).trim();
  if (raw === '') return null;

  // 去除斗鱼「回复」样式前缀
  const content = raw.replace(/^回复\s*/, '');

  // 候选确认回复须同时包含「温度值」与「剩余」
  if (!content.includes('温度值') || !content.includes('剩余')) return null;

  // 指令类型：优先「转给」→给分，其次「炸」→炸分
  let type = null;
  let keyword = null;
  if (content.includes('转给')) {
    type = 'give';
    keyword = '转给';
  } else if (content.includes('炸')) {
    type = 'bomb';
    keyword = '炸';
  }
  if (!keyword) return null;

  // 老板昵称：@ 之后至首个逗号/冒号之前
  const atIndex = content.indexOf('@');
  let boss = '';
  if (atIndex !== -1) {
    const rest = content.slice(atIndex + 1);
    const delimIndex = rest.search(BOSS_DELIMITER);
    boss = (delimIndex === -1 ? rest : rest.slice(0, delimIndex)).trim();
  }

  // 关键词定位：从老板昵称之后开始查找，避免昵称中的同名字符干扰
  const minIndex = atIndex === -1 ? 0 : atIndex + 1 + boss.length;
  const keywordIndex = content.indexOf(keyword, minIndex);
  if (keywordIndex === -1) return null;

  // 团员名 / 数值：关键词与「温度值」之间的文本
  const afterKeyword = content.slice(keywordIndex + keyword.length);
  const tempIndex = afterKeyword.indexOf('温度值');
  const segment =
    tempIndex === -1 ? afterKeyword : afterKeyword.slice(0, tempIndex);
  const parsed = splitMemberAndValue(segment, members);

  // 剩余额度
  const remainingMatched = content.slice(keywordIndex).match(REMAINING_PATTERN);
  if (!remainingMatched) return null;

  return {
    boss,
    type,
    member: parsed ? parsed.member : null,
    value: parsed ? parsed.value : null,
    remaining: Number(remainingMatched[1]),
  };
}
