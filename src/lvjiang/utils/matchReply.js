/**
 * 驴酱青春团 · 确认回复与指令关联匹配（纯函数）
 * 设计原则：宁可不标记，不可错标记。
 * 一条确认回复只标记一条指令，标记后该指令移出待确认队列。
 */

/**
 * 按优先级在待确认队列中查找匹配的指令条目
 * 优先级：① 老板+团员+数值 ② 老板+团员 ③ 老板
 *        ④ 团员+数值（仅当回复中解析不出老板昵称时）⑤ 不标记
 * @param {Object} reply - 解析后的确认回复 {boss, member, value}
 * @param {Array} pendingList - 待确认指令列表（按时间升序）
 * @returns {Object|null} 命中的指令条目，未命中返回 null
 */
export function matchReply(reply, pendingList) {
  if (!reply || !Array.isArray(pendingList) || pendingList.length === 0) {
    return null;
  }

  const candidates = pendingList.filter(
    item => item && item.status === 'pending'
  );
  if (candidates.length === 0) return null;

  const { boss, member, value } = reply;
  const hasValue = value !== null && value !== undefined;
  // 取最近（列表末尾，按时间升序）一条
  const pickLast = list => (list.length > 0 ? list[list.length - 1] : null);

  // ① 老板 + 团员 + 数值
  if (boss && member && hasValue) {
    const hit = pickLast(
      candidates.filter(
        item =>
          item.boss === boss &&
          item.member === member &&
          Number(item.value) === Number(value)
      )
    );
    if (hit) return hit;
  }

  // ② 老板 + 团员
  if (boss && member) {
    const hit = pickLast(
      candidates.filter(item => item.boss === boss && item.member === member)
    );
    if (hit) return hit;
  }

  // ③ 老板（团员名解析失败时兜底）
  if (boss) {
    const hit = pickLast(candidates.filter(item => item.boss === boss));
    if (hit) return hit;
  }

  // ④ 团员 + 数值（仅当回复中解析不出老板昵称时）
  if (!boss && member && hasValue) {
    const hit = pickLast(
      candidates.filter(
        item => item.member === member && Number(item.value) === Number(value)
      )
    );
    if (hit) return hit;
  }

  // ⑤ 不标记
  return null;
}
