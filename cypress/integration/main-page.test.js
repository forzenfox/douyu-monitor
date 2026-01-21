/// <reference types="cypress" />

describe('Main Page E2E Tests', () => {
  beforeEach(() => {
    // 访问测试页面
    cy.visit('/');
  });

  it('should load main page correctly', () => {
    // 验证页面结构
    cy.get('.monitor-container').should('exist');
    cy.get('.monitor-content').should('exist');
    cy.get('.monitor-content').should('be.visible');
  });

  it('should open config panel when clicking on monitor area', () => {
    // 点击监控区域打开配置面板
    cy.get('.monitor-content').click();

    // 验证配置面板显示
    cy.get('.config-panel').should('be.visible');
    cy.get('.config-tabs').should('exist');
  });

  it('should display all config tabs', () => {
    // 打开配置面板
    cy.get('.monitor-content').click();

    // 验证所有配置标签页存在
    cy.get('.van-tab').contains('通用配置').should('exist');
    cy.get('.van-tab').contains('弹幕配置').should('exist');
    cy.get('.van-tab').contains('礼物配置').should('exist');
    cy.get('.van-tab').contains('进场配置').should('exist');
    cy.get('.van-tab').contains('超级弹幕配置').should('exist');
  });

  it('should switch between config tabs', () => {
    // 打开配置面板
    cy.get('.monitor-content').click();

    // 切换到超级弹幕配置标签页
    cy.get('.van-tab').contains('超级弹幕配置').click();

    // 验证当前激活的是超级弹幕配置标签页
    cy.get('.van-tab--active').contains('超级弹幕配置').should('exist');

    // 切换到礼物配置标签页
    cy.get('.van-tab').contains('礼物配置').click();

    // 验证当前激活的是礼物配置标签页
    cy.get('.van-tab--active').contains('礼物配置').should('exist');
  });

  it('should close config panel when clicking close button', () => {
    // 打开配置面板
    cy.get('.monitor-content').click();
    cy.get('.config-panel').should('be.visible');

    // 点击关闭按钮
    cy.get('.config-panel .close-btn').click();

    // 验证配置面板隐藏
    cy.get('.config-panel').should('not.be.visible');
  });

  it('should display loading state initially', () => {
    // 验证加载状态显示
    cy.get('.loading-container').should('exist');
    cy.get('.loading-text').contains('正在连接服务器...').should('exist');
  });

  it('should have correct initial layout', () => {
    // 验证初始布局结构
    cy.get('.monitor-content').should('have.css', 'flex-direction', 'column');
  });
});
