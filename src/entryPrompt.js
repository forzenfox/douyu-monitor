/**
 * 首页入口选择弹窗
 *
 * 访问站点根路径时（Vue 尚未挂载）弹出，让用户选择进入「团播看板」还是「通用监控」。
 * 选择通用监控后进入第二步输入真实房间号；选择团播看板直接返回类型，由路由完成跳转。
 */

const MODAL_STYLE = `
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

const CONTENT_STYLE = `
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
`;

const TITLE_STYLE = `
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const OPTION_STYLE = `
  display: block;
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: white;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s;
`;

const OPTION_NAME_STYLE = `
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
`;

const OPTION_DESC_STYLE = `
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
`;

const ACTIONS_STYLE = `
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const SECONDARY_BUTTON_STYLE = `
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: white;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
`;

const PRIMARY_BUTTON_STYLE = `
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: #409eff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
`;

const INPUT_STYLE = `
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 8px;
  box-sizing: border-box;
  transition: all 0.2s;
`;

const ERROR_STYLE = `
  min-height: 18px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #f56c6c;
`;

const HOVER_STYLE = `
  .entry-option:hover,
  .entry-option:focus-visible {
    border-color: #409eff;
    background-color: #f5f9ff;
    outline: none;
  }
  .entry-option--lvjiang:hover,
  .entry-option--lvjiang:focus-visible {
    border-color: #ff6f00;
    background-color: #fff7f0;
  }
  .entry-secondary:hover {
    border-color: #c0c4cc;
    color: #409eff;
  }
  .entry-primary:hover {
    background-color: #66b1ff;
  }
`;

/**
 * 创建元素
 * @param {string} tag - 标签名
 * @param {string} cssText - 内联样式
 * @param {string} [className] - 类名
 * @returns {HTMLElement} 元素
 */
function createEl(tag, cssText, className) {
  const node = document.createElement(tag);
  node.style.cssText = cssText;
  if (className) node.className = className;
  return node;
}

/**
 * 弹出入口选择弹窗
 * @returns {Promise<{type: 'lvjiang'} | {type: 'monitor', rid: string} | null>}
 *          选择团播看板返回类型；选择通用监控并输入房间号后返回房间号；取消返回 null
 */
export function createEntryPrompt() {
  return new Promise(resolve => {
    // 保证同一时刻只有一个入口弹窗
    document.querySelectorAll('.entry-modal').forEach(node => node.remove());

    const modal = createEl('div', MODAL_STYLE, 'entry-modal');
    const content = createEl('div', CONTENT_STYLE);

    const hoverStyle = document.createElement('style');
    hoverStyle.textContent = HOVER_STYLE;
    modal.appendChild(hoverStyle);

    let settled = false;

    /**
     * 关闭弹窗
     * @param {{type: string, rid?: string}|null} value - 返回给调用方的结果
     */
    function close(value) {
      if (settled) return;
      settled = true;
      document.removeEventListener('keydown', onKeydown);
      modal.remove();
      resolve(value);
    }

    function onKeydown(event) {
      if (event.key === 'Escape') close(null);
    }
    document.addEventListener('keydown', onKeydown);

    // 标题在两步之间复用
    const title = createEl('h3', TITLE_STYLE, 'entry-title');
    title.textContent = '请选择进入的页面';

    // ---- 第一步：选择页面类型 ----
    const typeStep = createEl('div', '', 'entry-step entry-step--type');
    typeStep.style.display = 'block';

    /**
     * 构建入口选项
     * @param {string} className - 选项类名
     * @param {string} name - 主标题
     * @param {string} desc - 说明文案
     * @param {Function} onClick - 点击回调
     * @returns {HTMLElement} 选项按钮
     */
    function createOption(className, name, desc, onClick) {
      const option = createEl(
        'button',
        OPTION_STYLE,
        `entry-option ${className}`
      );
      const nameEl = createEl('span', OPTION_NAME_STYLE);
      nameEl.textContent = name;
      const descEl = createEl('span', OPTION_DESC_STYLE);
      descEl.textContent = desc;
      option.appendChild(nameEl);
      option.appendChild(descEl);
      option.addEventListener('click', onClick);
      return option;
    }

    typeStep.appendChild(
      createOption(
        'entry-option--lvjiang',
        '驴酱青春团',
        '团播温度值看板（给分 / 炸分指令确认）',
        () => close({ type: 'lvjiang' })
      )
    );
    typeStep.appendChild(
      createOption(
        'entry-option--monitor',
        '通用监控',
        '弹幕 / 礼物 / 进场',
        () => showRidStep()
      )
    );

    const typeActions = createEl('div', ACTIONS_STYLE);
    const cancelBtn = createEl(
      'button',
      SECONDARY_BUTTON_STYLE,
      'entry-cancel entry-secondary'
    );
    cancelBtn.textContent = '取消';
    cancelBtn.addEventListener('click', () => close(null));
    typeActions.appendChild(cancelBtn);
    typeStep.appendChild(typeActions);

    // ---- 第二步：输入真实房间号 ----
    const ridStep = createEl('div', '', 'entry-step entry-step--rid');
    ridStep.style.display = 'none';

    const input = createEl('input', INPUT_STYLE, 'entry-input');
    input.type = 'text';
    input.placeholder = '请输入房间号';
    input.addEventListener('focus', () => {
      input.style.borderColor = '#409eff';
    });
    input.addEventListener('blur', () => {
      input.style.borderColor = '#dcdfe6';
    });

    const errorText = createEl('div', ERROR_STYLE, 'entry-error');

    /**
     * 提交房间号
     */
    function submitRid() {
      const value = input.value.trim();
      if (value === '') {
        errorText.textContent = '请输入房间号';
        input.focus();
        return;
      }
      close({ type: 'monitor', rid: value });
    }

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') submitRid();
    });

    ridStep.appendChild(input);
    ridStep.appendChild(errorText);

    const ridActions = createEl('div', ACTIONS_STYLE);
    const backBtn = createEl(
      'button',
      SECONDARY_BUTTON_STYLE,
      'entry-back entry-secondary'
    );
    backBtn.textContent = '返回';
    backBtn.addEventListener('click', () => showTypeStep());

    const confirmBtn = createEl(
      'button',
      PRIMARY_BUTTON_STYLE,
      'entry-confirm entry-primary'
    );
    confirmBtn.textContent = '确定';
    confirmBtn.addEventListener('click', () => submitRid());

    ridActions.appendChild(backBtn);
    ridActions.appendChild(confirmBtn);
    ridStep.appendChild(ridActions);

    /**
     * 进入房间号输入步骤
     */
    function showRidStep() {
      title.textContent = '请输入真实房间号';
      typeStep.style.display = 'none';
      ridStep.style.display = 'block';
      errorText.textContent = '';
      input.focus();
    }

    /**
     * 返回入口选择步骤
     */
    function showTypeStep() {
      title.textContent = '请选择进入的页面';
      ridStep.style.display = 'none';
      typeStep.style.display = 'block';
      errorText.textContent = '';
    }

    content.appendChild(title);
    content.appendChild(typeStep);
    content.appendChild(ridStep);
    modal.appendChild(content);
    document.body.appendChild(modal);
  });
}
