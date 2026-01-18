// 自定义Cypress命令

// 登录命令
Cypress.Commands.add('login', (username, password) => {
  // 实现登录逻辑
})

// 访问配置页面命令
Cypress.Commands.add('goToConfigPage', () => {
  cy.visit('/config')
})

// 访问主页面命令
Cypress.Commands.add('goToMainPage', () => {
  cy.visit('/')
})

// 模拟WebSocket消息命令
Cypress.Commands.add('mockWebSocketMessage', (message) => {
  // 实现WebSocket消息模拟
})
