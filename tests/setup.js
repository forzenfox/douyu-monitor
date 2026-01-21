import { config } from '@vue/test-utils';

// 设置全局测试配置
config.global.stubs = {
  // 添加需要的存根组件
  'van-tabs': true,
  'van-tab': true,
  'van-field': true,
  'van-checkbox': true,
  'van-checkbox-group': true,
  'van-radio': true,
  'van-radio-group': true,
  'van-switch': true,
  'van-slider': true,
  'van-popup': true,
};
