<template>
  <div 
    ref="domCommandDanmaku" 
    class="command-danmaku" 
  >
    <div class="command-danmaku-list">
      <Default
        v-for="item in displayList"
        v-memo="[options.mode, options.animation]"
        :key="item.id"
        :data="item"
        :color="getCommandColor(item.command)"
        :showAnimation="options.animation"
        @click="handleCommandClick(item.id)"
      ></Default>
      <div v-if="displayList.length === 0" class="empty-tip">
        暂无指令弹幕
      </div>
    </div>
    <div v-show="isLock" class="gobottom" @click.stop="goToScrollBottom(domCommandDanmaku.value?.querySelector('.command-danmaku-list'))">回到底部</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUpdated } from 'vue'
import Default from "./templates/Default.vue"

import { useFlexStyle } from "../../hooks/useFlexStyle.js"
import { useBorderStyle } from "../../hooks/useBorderStyle.js"
import { useScroll } from '../../hooks/useScroll.js'

let props = defineProps({
  maxOrder: {
    type: Number,
  },
  options: {
    type: Object,
  },
  commandDanmakuList: {
    type: Array,
    default: () => []
  }
});

let domCommandDanmaku = ref(null);
let { flexStyle, orderStyle, justifyContentStyle, textAlignStyle } = useFlexStyle(props, "commandDanmaku");
let { borderBottomStyle, borderRightStyle } = useBorderStyle(props, "commandDanmaku");
let { isLock, onScroll, onScrollUpdate, goToScrollBottom } = useScroll();

// 获取指令对应的颜色
const getCommandColor = (commandName) => {
  const keywords = props.options?.commandDanmaku?.keywords || [];
  const keyword = keywords.find(kw => kw.name === commandName && kw.enabled);
  return keyword?.color || '#007bff'; // 默认蓝色
};

// 计算实际展示的弹幕列表（不限制数量）
const displayList = computed(() => {
  return props.commandDanmakuList;
});

// 监听弹幕列表变化，自动滚动到底部
watch(() => props.commandDanmakuList.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    setTimeout(() => {
      goToScrollBottom(domCommandDanmaku.value?.querySelector('.command-danmaku-list'));
    }, 100);
  }
});

/**
 * 处理指令弹幕点击事件
 * @param {string} id - 指令弹幕ID
 */
const handleCommandClick = (id) => {
  // 标记对应的指令弹幕为已过期
  const index = props.commandDanmakuList.findIndex(item => item.id === id);
  if (index !== -1) {
    // 直接修改原数组中的对象，标记为已过期
    props.commandDanmakuList[index].isExpired = true;
  }
};

onUpdated(() => {
  const listDom = domCommandDanmaku.value?.querySelector('.command-danmaku-list');
  if (listDom) {
    onScrollUpdate(listDom);
  }
});

onMounted(() => {
  const listDom = domCommandDanmaku.value?.querySelector('.command-danmaku-list');
  if (listDom) {
    listDom.addEventListener("mousewheel", () => {
      onScroll(listDom);
    });
    listDom.addEventListener("touchmove", () => {
      onScroll(listDom);
    });
  }
});
</script>

<style lang="scss" scoped>
@use "@/global/styles/themes/index.scss" as *;

.command-danmaku {
  height: 100%;
  display: flex;
  flex-direction: column;
  order: v-bind(orderStyle);
  flex: v-bind(flexStyle);
  border-bottom: v-bind(borderBottomStyle);
  border-right: v-bind(borderRightStyle);
  overflow: hidden;
  
  // 使用与其他弹幕一致的背景和文字颜色
  background-color: transparent;
  color: inherit;
  

  
  .command-danmaku-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 5px 10px 10px; // 添加顶部内边距，与弹幕间距一致
    
    // 日间模式背景
    :deep(.day) & {
      background-color: rgba(255, 255, 255, 0.9);
    }
    
    // 夜间模式背景
    :deep(.night) & {
      background-color: rgba(0, 0, 0, 0.3);
    }
    
    // 滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      
      :deep(.night) & {
        background: rgba(255, 255, 255, 0.05);
      }
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
      
      :deep(.night) & {
        background: rgba(255, 255, 255, 0.2);
        
        &:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      }
    }
  }
  
  .empty-tip {
    text-align: center;
    padding: 20px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 14px;
    
    :deep(.night) & {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>