<template>
  <div ref="dom_superchat" class="superchat">
    <Default
      v-for="item in superchatList"
      v-memo="[options.mode, options.animation]"
      :key="item.key"
      :data="item"
      :mode="options.mode"
      :showAnimation="options.animation"
      :options="options"
    ></Default>
    <div v-if="superchatList.length === 0" class="empty-tip">暂无超级弹幕</div>
    <div
      v-show="isLock"
      class="gobottom"
      @click.stop="goToScrollBottom(dom_superchat)"
    >
      回到底部
    </div>
  </div>
</template>

<script setup>
import { ref, onUpdated, onMounted } from 'vue';
import Default from './templates/Default.vue';

import { useFlexStyle } from '../../hooks/useFlexStyle.js';
import { useBorderStyle } from '../../hooks/useBorderStyle.js';
import { useScroll } from '../../hooks/useScroll.js';

let props = defineProps({
  maxOrder: {
    type: Number,
  },
  options: {
    type: Object,
  },
  superchatList: {
    type: Array,
  },
});

let dom_superchat = ref(null);
let { flexStyle, orderStyle, justifyContentStyle, textAlignStyle } =
  useFlexStyle(props, 'superchat');
let { borderBottomStyle, borderRightStyle } = useBorderStyle(
  props,
  'superchat'
);
let { isLock, onScroll, onScrollUpdate, goToScrollBottom } = useScroll();

onUpdated(() => {
  onScrollUpdate(dom_superchat.value);
});

onMounted(() => {
  // 添加滚动事件监听
  if (dom_superchat.value) {
    dom_superchat.value.addEventListener('mousewheel', () => {
      onScroll(dom_superchat.value);
    });
    dom_superchat.value.addEventListener('touchmove', () => {
      onScroll(dom_superchat.value);
    });
  }
});
</script>

<style lang="scss" scoped>
@use '@/global/styles/themes/index.scss' as *;
.superchat {
  height: 100%;
  order: v-bind(orderStyle);
  flex: v-bind(flexStyle);
  border-bottom: v-bind(borderBottomStyle);
  border-right: v-bind(borderRightStyle);
  overflow-x: hidden;
  overflow-y: auto;
  content-visibility: auto;
  position: relative;
  .item {
    justify-content: v-bind(justifyContentStyle);
    text-align: v-bind(textAlignStyle);
  }

  // 空状态提示样式
  .empty-tip {
    text-align: center;
    padding: 20px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 14px;

    [data-theme='night'] & {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
