<template>
  <div ref="dom_gift" class="gift">
    <Deafult
      v-for="item in giftList"
      v-memo="[options.mode, options.animation, options.gift.totalPrice]"
      :data="item"
      :key="item.key"
      :giftData="allGiftData[item.gfid]"
      :mode="options.mode"
      :showAnimation="options.animation"
      :totalPrice="options.gift.totalPrice"
    ></Deafult>
    <div v-if="giftList.length === 0" class="empty-tip">暂无礼物信息</div>
    <div
      v-show="isLock"
      class="gobottom"
      @click.stop="goToScrollBottom(dom_gift)"
    >
      回到底部
    </div>
  </div>
</template>

<script setup>
import { ref, onUpdated, onMounted } from 'vue';
import Deafult from './templates/Default.vue';
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
  giftList: {
    type: Array,
  },
  allGiftData: {
    type: Object,
  },
});
let { flexStyle, orderStyle, justifyContentStyle, textAlignStyle } =
  useFlexStyle(props, 'gift');
let { borderBottomStyle, borderRightStyle } = useBorderStyle(props, 'gift');
let { isLock, onScroll, onScrollUpdate, goToScrollBottom } = useScroll();
let dom_gift = ref(null);

onUpdated(() => {
  onScrollUpdate(dom_gift.value);
});
onMounted(() => {
  // 修复：在添加事件监听器之前检查DOM元素是否存在
  if (dom_gift.value) {
    dom_gift.value.addEventListener('mousewheel', () => {
      onScroll(dom_gift.value);
    });
    dom_gift.value.addEventListener('touchmove', () => {
      onScroll(dom_gift.value);
    });
  }
});
</script>

<style lang="scss" scoped>
.gift {
  height: 100%;
  order: v-bind(orderStyle);
  flex: v-bind(flexStyle);
  border-bottom: v-bind(borderBottomStyle);
  border-right: v-bind(borderRightStyle);
  overflow-x: hidden;
  overflow-y: auto;
  content-visibility: auto;
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
