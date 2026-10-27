<template>
  <div ref="domBoard" class="lvjiang-board">
    <div class="lvjiang-board-list">
      <Default
        v-for="item in displayList"
        v-memo="[options.mode, options.animation]"
        :key="item.id"
        :data="item"
        :showConfirmCost="options.showConfirmCost"
        :class="{ fadeInLeft: options.animation }"
        @click="handleItemClick(item.id)"
      ></Default>
      <div v-if="displayList.length === 0" class="empty-tip">暂无团播指令</div>
    </div>
    <div
      v-show="isLock"
      class="gobottom"
      @click.stop="
        goToScrollBottom(domBoard.value?.querySelector('.lvjiang-board-list'))
      "
    >
      回到底部
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUpdated } from 'vue';
import Default from './templates/Default.vue';
import { useScroll } from '@/monitor/hooks/useScroll.js';
import { useExpiredAutoRemove } from '@/monitor/hooks/useExpiredAutoRemove.js';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  commandList: {
    type: Array,
    default: () => [],
  },
});

const domBoard = ref(null);
const { isLock, onScroll, onScrollUpdate, goToScrollBottom } = useScroll();

// 复用置灰自动移除逻辑（映射到看板配置键）
const { schedule } = useExpiredAutoRemove(
  () => ({
    autoRemoveExpired: props.options?.autoRemoveHandled,
    autoRemoveDelay: props.options?.autoRemoveDelay,
  }),
  () => props.commandList
);

const displayList = computed(() => props.commandList);

/**
 * 点击条目：手动置灰表示已处理，并按配置安排自动移除
 * @param {string} id - 条目ID
 */
const handleItemClick = id => {
  const index = props.commandList.findIndex(item => item.id === id);
  if (index === -1) return;
  props.commandList[index].isHandled = true;
  schedule(id);
};

// 监听列表变化，自动滚动到底部
watch(
  () => props.commandList.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      setTimeout(() => {
        goToScrollBottom(domBoard.value?.querySelector('.lvjiang-board-list'));
      }, 100);
    }
  }
);

onUpdated(() => {
  const listDom = domBoard.value?.querySelector('.lvjiang-board-list');
  if (listDom) {
    onScrollUpdate(listDom);
  }
});

onMounted(() => {
  const listDom = domBoard.value?.querySelector('.lvjiang-board-list');
  if (listDom) {
    listDom.addEventListener('mousewheel', () => {
      onScroll(listDom);
    });
    listDom.addEventListener('touchmove', () => {
      onScroll(listDom);
    });
  }
});
</script>

<style lang="scss" scoped>
.lvjiang-board {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: transparent;
  color: inherit;

  .lvjiang-board-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* 顶部留白，避免首条指令被页面级连接状态浮标遮挡 */
    padding: 44px 10px 10px;

    :deep(.day) & {
      background-color: rgba(255, 255, 255, 0.9);
    }

    :deep(.night) & {
      background-color: rgba(0, 0, 0, 0.3);
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.35);
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

// 淡入动画（沿用现有动画风格）
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fadeInLeft {
  animation: fadeInLeft 0.3s ease;
}
</style>
