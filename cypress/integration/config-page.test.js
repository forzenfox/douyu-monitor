/// <reference types="cypress" />

describe('Config Page E2E Tests', () => {
  beforeEach(() => {
    // 访问测试页面
    cy.visit('/');

    // 打开配置面板
    cy.get('.monitor-content').click();
    cy.get('.config-panel').should('be.visible');
  });

  it('should update general config settings', () => {
    // 确保在通用配置标签页
    cy.get('.van-tab--active').contains('通用配置').should('exist');

    // 修改方向设置
    cy.get('.van-radio-group').contains('横向').click();

    // 修改字体大小
    cy.get('.van-slider').as('fontSizeSlider');
    cy.get('@fontSizeSlider').invoke('val', 20).trigger('input');

    // 修改背景透明设置
    cy.get('.van-switch').eq(0).click();

    // 验证设置已更新
    cy.get('.van-radio--checked').contains('横向').should('exist');
    cy.get('.van-slider__button').should('have.attr', 'style', /left: 50%/);
  });

  it('should update danmaku config settings', () => {
    // 切换到弹幕配置标签页
    cy.get('.van-tab').contains('弹幕配置').click();
    cy.get('.van-tab--active').contains('弹幕配置').should('exist');

    // 修改弹幕显示选项
    cy.get('.danmaku-options .van-checkbox').eq(0).click(); // 等级
    cy.get('.danmaku-options .van-checkbox').eq(2).click(); // 粉丝牌

    // 修改弹幕占比
    cy.get('.danmaku-size .van-slider').invoke('val', 30).trigger('input');

    // 验证设置已更新
    cy.get('.danmaku-size .van-slider__button').should(
      'have.attr',
      'style',
      /left: 30%/
    );
  });

  it('should update superchat config settings', () => {
    // 切换到超级弹幕配置标签页
    cy.get('.van-tab').contains('超级弹幕配置').click();
    cy.get('.van-tab--active').contains('超级弹幕配置').should('exist');

    // 修改超级弹幕关键词
    cy.get('.superchat-keyword .van-field__control').clear().type('新关键词');

    // 修改显示选项
    cy.get('.superchat-options .van-checkbox').eq(1).click(); // 贵族
    cy.get('.superchat-options .van-checkbox').eq(3).click(); // 钻粉

    // 修改语音播报设置
    cy.get('.superchat-speak .van-switch').click();

    // 验证设置已更新
    cy.get('.superchat-keyword .van-field__control').should(
      'have.value',
      '新关键词'
    );
  });

  it('should save config and persist on reload', () => {
    // 切换到超级弹幕配置标签页
    cy.get('.van-tab').contains('超级弹幕配置').click();

    // 修改超级弹幕关键词
    cy.get('.superchat-keyword .van-field__control').clear().type('测试关键词');

    // 关闭配置面板（自动保存）
    cy.get('.config-panel .close-btn').click();

    // 刷新页面
    cy.reload();

    // 重新打开配置面板
    cy.get('.monitor-content').click();
    cy.get('.van-tab').contains('超级弹幕配置').click();

    // 验证配置已保存
    cy.get('.superchat-keyword .van-field__control').should(
      'have.value',
      '测试关键词'
    );
  });

  it('should share config correctly', () => {
    // 点击分享按钮
    cy.get('.share-btn').click();

    // 验证分享弹窗显示
    cy.get('.share-popup').should('be.visible');
    cy.get('.share-input').should('exist');

    // 关闭分享弹窗
    cy.get('.share-popup .close-btn').click();
    cy.get('.share-popup').should('not.be.visible');
  });

  it('should import config from url', () => {
    // 构造一个包含配置的URL
    const config = {
      size: { danmaku: 30, gift: 30, enter: 20, superchat: 20 },
      mode: 'night',
    };
    const encodedConfig = btoa(JSON.stringify(config));
    const testUrl = `${window.location.origin}?config=${encodedConfig}`;

    // 访问包含配置的URL
    cy.visit(testUrl);

    // 打开配置面板
    cy.get('.monitor-content').click();

    // 验证配置已导入
    cy.get('.danmaku-size .van-slider__button').should(
      'have.attr',
      'style',
      /left: 30%/
    );
  });
});
