<template>
  <div class="command-danmaku-config">
    <!-- 基础设置 -->
    <div class="field-item">
      <div class="field-label">指令前缀</div>
      <div class="field-content">
        <div class="prefix-input-wrapper">
          <input 
            type="text" 
            class="prefix-input" 
            v-model="localOptions.prefix" 
            maxlength="2" 
            @input="handleOptionChange"
            placeholder="#"
          >
        </div>
      </div>
    </div>
    
    <!-- 语音提示设置 -->
    <div class="field-item">
      <div class="field-label">语音提示</div>
      <div class="field-content">
        <div class="speak-switch-wrapper">
          <label class="switch-label">
            <input 
              type="checkbox" 
              class="speak-switch" 
              v-model="localOptions.speak" 
              @change="handleOptionChange"
            >
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- 关键词管理 -->
    <div class="keyword-management">
      <div class="management-title">关键词管理</div>
      
      <!-- 关键词列表 -->
      <div class="keyword-list">
        <div 
          v-for="keyword in localOptions.keywords" 
          :key="keyword.id" 
          class="keyword-item"
        >
          <div class="field-item">
            <div class="field-label"></div>
            <div class="field-content">
              <div class="keyword-info">
                <input 
                  type="checkbox" 
                  class="keyword-checkbox" 
                  v-model="keyword.enabled" 
                  @change="handleOptionChange"
                >
                <span class="keyword-name">{{ keyword.name }}</span>
                <div class="color-picker-container">
                  <span class="color-picker-label">颜色</span>
                  <input 
                    type="color" 
                    class="color-picker" 
                    v-model="keyword.color" 
                    @change="handleOptionChange"
                  >
                </div>
                <button 
                  class="delete-btn" 
                  @click="deleteKeyword(keyword.id)"
                  title="删除"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 添加关键词 -->
      <div class="add-keyword-section">
        <!-- 添加关键词输入区 -->
        <div class="field-item">
          <div class="field-label">添加关键词</div>
          <div class="field-content">
            <div class="add-keyword-input">
              <input 
                type="text" 
                class="add-keyword-input-field" 
                v-model="newKeyword" 
                @keyup.enter="addKeyword" 
                placeholder="输入关键词，回车添加"
              >
              <button class="add-btn" @click="addKeyword">添加</button>
            </div>
          </div>
        </div>
        
        <!-- 预设模板 -->
        <div class="field-item">
          <div class="field-label">预设模板</div>
          <div class="field-content">
            <div class="preset-templates">
              <button 
                v-for="template in presetTemplates" 
                :key="template" 
                @click="addPresetKeyword(template)"
                class="template-btn"
              >
                {{ template }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Field } from 'vant'

const props = defineProps({
  options: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:options'])

// 本地配置副本，用于实时编辑
const localOptions = ref(JSON.parse(JSON.stringify(props.options.commandDanmaku)))

// 新关键词输入
const newKeyword = ref('')

// 预设模板
const presetTemplates = ['点歌', '转盘']

// 计算背景透明度
const backgroundOpacity = computed({
  get: () => {
    const bgColor = localOptions.value.styles.backgroundColor || 'rgba(0, 123, 255, 0.8)'
    const opacityMatch = bgColor.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/)
    return opacityMatch ? parseFloat(opacityMatch[1]) : 0.8
  },
  set: (value) => {
    const bgColor = localOptions.value.styles.backgroundColor || 'rgba(0, 123, 255, 0.8)'
    const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      localOptions.value.styles.backgroundColor = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${value})`
    }
  }
})

// 监听props变化，更新本地配置
watch(() => props.options.commandDanmaku, (newVal) => {
  localOptions.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true })

// 处理配置变化
const handleOptionChange = () => {
  emit('update:options', { ...props.options, commandDanmaku: { ...localOptions.value } })
}

// 处理透明度变化
const handleOpacityChange = () => {
  handleOptionChange()
}

// 添加关键词
const addKeyword = () => {
  if (!newKeyword.value.trim()) return
  
  // 检查关键词是否已存在
  const exists = localOptions.value.keywords.some(kw => kw.name === newKeyword.value.trim())
  if (exists) {
    alert('该关键词已存在')
    return
  }
  
  // 生成随机颜色
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16)
  
  const newKw = {
    id: `kw-${Date.now()}`,
    name: newKeyword.value.trim(),
    enabled: true,
    color: randomColor
  }
  
  localOptions.value.keywords.push(newKw)
  newKeyword.value = ''
  handleOptionChange()
}

// 删除关键词
const deleteKeyword = (id) => {
  localOptions.value.keywords = localOptions.value.keywords.filter(kw => kw.id !== id)
  handleOptionChange()
}

// 添加预设关键词
const addPresetKeyword = (template) => {
  // 检查关键词是否已存在
  const exists = localOptions.value.keywords.some(kw => kw.name === template)
  if (exists) {
    alert('该关键词已存在')
    return
  }
  
  // 生成随机颜色
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16)
  
  const newKw = {
    id: `kw-${Date.now()}`,
    name: template,
    enabled: true,
    color: randomColor
  }
  
  localOptions.value.keywords.push(newKw)
  handleOptionChange()
}
</script>

<style lang="scss" scoped>
/* 组件容器样式 */
.command-danmaku-config {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

/* 自定义字段样式，模仿Vant Field组件 */
.field-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #ebedf0;
  
  [data-theme="night"] & {
    border-bottom-color: #3a3a3a;
  }
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

/* 字段标签样式 */
.field-label {
  width: 100px;
  font-size: 14px;
  color: #646566;
  font-weight: 500;
  white-space: nowrap;
  margin-right: 16px;
  text-align: left;
  
  [data-theme="night"] & {
    color: #b0b0b0;
  }
}

/* 字段内容样式 */
.field-content {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

/* 关键词管理标题 */
.management-title {
  font-size: 16px;
  font-weight: 500;
  margin: 16px 0;
  color: #646566;
  
  [data-theme="night"] & {
    color: #b0b0b0;
  }
}

/* 指令前缀输入框容器 */
.prefix-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 指令前缀输入框样式 */
.prefix-input {
  width: 60px;
  padding: 8px 12px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  transition: all 0.3s ease;
  text-align: center;
  
  [data-theme="night"] & {
    background-color: #3a3a3a;
    border-color: #4a4a4a;
    color: #fff;
  }
  
  &:focus {
    outline: none;
    border-color: #1989fa;
  }
}

/* 语音提示开关容器样式 */
.speak-switch-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 开关标签样式 */
.switch-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

/* 隐藏原生checkbox */
.speak-switch {
  opacity: 0;
  width: 0;
  height: 0;
}

/* 开关滑块样式 */
.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ebedf0;
  transition: all 0.3s ease;
  border-radius: 12px;
  
  [data-theme="night"] & {
    background-color: #4a4a4a;
  }
}

/* 滑块内圆点样式 */
.switch-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: all 0.3s ease;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  [data-theme="night"] & {
    background-color: #3a3a3a;
  }
}

/* 开关激活状态 */
.speak-switch:checked + .switch-slider {
  background-color: #1989fa;
}

/* 滑块激活状态 */
.speak-switch:checked + .switch-slider:before {
  transform: translateX(20px);
  background-color: white;
  
  [data-theme="night"] & {
    background-color: #fff;
  }
}

/* 开关激活状态下的滑块颜色 */
[data-theme="night"] .speak-switch:checked + .switch-slider {
  background-color: #40a9ff;
}

/* 关键词列表样式 */
.keyword-list {
  margin-bottom: 16px;
}

/* 关键词项样式 */
.keyword-item {
  margin-bottom: 0;
}

/* 关键词信息样式 */
.keyword-info {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: flex-start;
}

/* 关键词复选框样式 */
.keyword-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 关键词名称样式 */
.keyword-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 80px;
  
  [data-theme="night"] & {
    color: #fff;
  }
}

/* 颜色选择器容器样式 */
.color-picker-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 颜色选择器标签样式 */
.color-picker-label {
  font-size: 12px;
  color: #909399;
  
  [data-theme="night"] & {
    color: #999;
  }
}

/* 颜色选择器样式 */
.color-picker {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  background: transparent;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* 删除按钮样式 */
.delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
    background-color: #ff7875;
    box-shadow: 0 2px 4px rgba(255, 77, 79, 0.2);
    transform: none;
  }
}

/* 添加关键词区域样式 */
.add-keyword-section {
  margin-bottom: 20px;
}

/* 添加关键词输入区样式 */
.add-keyword-input {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

/* 添加关键词输入框样式 */
.add-keyword-input-field {
  flex: 1;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  transition: all 0.3s ease;
  
  [data-theme="night"] & {
    background-color: #3a3a3a;
    border-color: #4a4a4a;
    color: #fff;
  }
  
  &:focus {
    outline: none;
    border-color: #1989fa;
  }
}

/* 添加按钮样式 */
.add-btn {
  padding: 8px 16px;
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: #40a9ff;
  }
}

/* 预设模板区域样式 */
.preset-templates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

/* 预设模板按钮样式 */
.template-btn {
  padding: 6px 12px;
  background-color: #f0f2f5;
  color: #646566;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  [data-theme="night"] & {
    background-color: #3a3a3a;
    color: #b0b0b0;
  }
  
  &:hover {
    background-color: #e4e6eb;
    
    [data-theme="night"] & {
      background-color: #4a4a4a;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .field-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 0;
  }
  
  .field-label {
    width: auto;
    margin-right: 0;
    font-size: 13px;
  }
  
  .field-content {
    width: 100%;
  }
  
  .keyword-info {
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  
  .keyword-checkbox {
    order: 1;
  }
  
  .keyword-name {
    order: 2;
    flex: 1;
    min-width: 60px;
    font-size: 13px;
  }
  
  .color-picker-container {
    order: 3;
    flex: 1;
    min-width: 120px;
    justify-content: flex-start;
    gap: 6px;
  }
  
  .color-picker-label {
    font-size: 11px;
  }
  
  .color-picker {
    width: 28px;
    height: 28px;
  }
  
  .delete-btn {
    order: 4;
    width: 22px;
    height: 22px;
    font-size: 12px;
  }
  
  .add-keyword-input {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .add-keyword-input-field {
    width: 100%;
    max-width: none;
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .add-btn {
    width: 100%;
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .prefix-input {
    width: 100%;
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .preset-templates {
    gap: 6px;
  }
  
  .template-btn {
    padding: 5px 10px;
    font-size: 13px;
  }
}
</style>