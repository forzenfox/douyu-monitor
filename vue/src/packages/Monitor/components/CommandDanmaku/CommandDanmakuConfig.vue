<template>
  <div class="command-danmaku-config">
    <div class="config-section">
      <div class="config-row">
        <div class="config-item">
          <label class="input-label">
            <span>指令前缀：</span>
            <input 
              type="text" 
              v-model="localOptions.prefix" 
              maxlength="2" 
              @input="handleOptionChange"
              placeholder="#"
            >
          </label>
        </div>
      </div>
    </div>
    
    <div class="config-section">
      <div class="keyword-list">
        <div 
          v-for="keyword in localOptions.keywords" 
          :key="keyword.id" 
          class="keyword-item"
        >
          <div class="keyword-info">
            <input 
              type="checkbox" 
              v-model="keyword.enabled" 
              @change="handleOptionChange"
            >
            <span class="keyword-name">{{ keyword.name }}</span>
            <div class="keyword-color">
              <span>颜色：</span>
              <input 
                type="color" 
                v-model="keyword.color" 
                @change="handleOptionChange"
                :style="{ backgroundColor: keyword.color }"
              >
            </div>
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
      <div class="keyword-operations">
        <div class="add-keyword">
          <input 
            type="text" 
            v-model="newKeyword" 
            @keyup.enter="addKeyword" 
            placeholder="输入关键词，回车添加"
          >
          <button @click="addKeyword">添加</button>
        </div>
        <div class="preset-templates">
          <span>预设模板：</span>
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
</template>

<script setup>
import { ref, watch, computed } from 'vue'

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
const presetTemplates = ['点歌', '转盘', '抽奖', '投票']

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
/* 重置默认样式，确保组件样式正确应用 */
.command-danmaku-config {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  color: #333;
  
  /* 确保日间模式下的文本颜色正确 */
  :deep(.day) & {
    color: #333;
  }
  
  /* 夜间模式下的文本颜色 */
  :deep(.night) & {
    color: #fff;
  }
}

.config-section {
    margin-bottom: 10px;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    
    :deep(.night) & {
        background-color: rgba(0, 0, 0, 0.2);
    }
}

.config-item {
  margin-bottom: 15px;
  display: block;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// 开关样式
.switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px;
  
  input[type="checkbox"] {
    margin-right: 8px;
    cursor: pointer;
    width: 16px;
    height: 16px;
  }
  
  .switch-text {
    font-size: 14px;
    color: #333;
    
    :deep(.night) & {
      color: #fff;
    }
  }
}

// 配置行样式
.config-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  
  .config-item {
    flex: 1;
    min-width: 200px;
  }
}

// 输入框样式
.input-label {
  display: flex;
  align-items: center;
  width: 100%;
  
  span {
    width: 100px;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    
    :deep(.night) & {
      color: #fff;
    }
  }
  
  input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background-color: #fff;
    flex: 1;
    min-width: 0;
    
    :deep(.night) & {
      background-color: #333;
      border-color: #555;
      color: #fff;
    }
    
    &[type="text"] {
      width: auto;
      flex: 0 0 80px;
    }
    
    &[type="number"] {
      width: auto;
      flex: 0 0 60px;
    }
    
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  }
}

// 显示设置样式
.display-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  
  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    input[type="checkbox"] {
      margin-right: 6px;
      cursor: pointer;
    }
    
    .checkbox-text {
      font-size: 14px;
      color: #333;
      
      :deep(.night) & {
        color: #fff;
      }
    }
  }
}

// 关键词列表
.keyword-list {
  margin-bottom: 15px;
  width: 100%;
}

.keyword-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  
  :deep(.night) & {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .keyword-info {
    display: flex;
    align-items: center;
    
    input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
      width: 16px;
      height: 16px;
    }
    
    .keyword-name {
      font-size: 14px;
      color: #333;
      margin-right: 12px;
      
      :deep(.night) & {
        color: #fff;
      }
    }
    
    .keyword-color {
      display: flex;
      align-items: center;
      
      span {
        font-size: 14px;
        color: #666;
        margin-right: 6px;
        
        :deep(.night) & {
          color: #aaa;
        }
      }
      
      input[type="color"] {
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        padding: 2px;
        background: transparent;
      }
    }
  }
  
  .delete-btn {
    background-color: rgba(255, 0, 0, 0.5);
    color: #ffffff;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 16px;
    line-height: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(255, 0, 0, 0.8);
    }
  }
}

// 关键词操作
.keyword-operations {
  width: 100%;
  
  .add-keyword {
    display: flex;
    margin-bottom: 10px;
    width: 100%;
    
    input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
      font-size: 14px;
      background-color: #fff;
      min-width: 0;
      
      :deep(.night) & {
        background-color: #333;
        border-color: #555;
        color: #fff;
      }
      
      &:focus {
        outline: none;
        border-color: #007bff;
      }
    }
    
    button {
      padding: 8px 16px;
      background-color: #007bff;
      color: #ffffff;
      border: none;
      border-radius: 0 4px 4px 0;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      white-space: nowrap;
      
      &:hover {
        background-color: #0056b3;
      }
    }
  }
  
  .preset-templates {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    
    span {
      font-size: 14px;
      color: #333;
      margin-right: 5px;
      
      :deep(.night) & {
        color: #fff;
      }
    }
    
    .template-btn {
      margin-right: 8px;
      padding: 6px 12px;
      background-color: #e9ecef;
      color: #495057;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      :deep(.night) & {
        background-color: #343a40;
        color: #ffffff;
      }
      
      &:hover {
        background-color: #dee2e6;
        
        :deep(.night) & {
          background-color: #495057;
        }
      }
    }
  }
}

// 样式设置
.style-config {
  width: 100%;
  
  .style-item {
    margin-bottom: 15px;
    display: block;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    label {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #333;
      width: 100%;
      
      :deep(.night) & {
        color: #fff;
      }
      
      span {
        width: 100px;
        white-space: nowrap;
      }
      
      input[type="range"] {
        flex: 1;
        margin: 0 10px;
        width: auto;
      }
      
      .value-display {
        width: 40px;
        text-align: right;
        font-size: 12px;
        color: #666;
        
        :deep(.night) & {
          color: #ccc;
        }
      }
    }
  }
}
</style>