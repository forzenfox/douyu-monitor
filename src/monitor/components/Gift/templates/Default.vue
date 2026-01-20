<template>
  <div
    :class="`item ${showAnimation ? 'fadeInLeft' : ''} ${getItemClass(data)}`"
  >
    <span class="item__gift">
      <img
        class="gift-avatar"
        :src="avatarSrc"
        loading="lazy"
        :alt="giftName"
      />
    </span>
    <span class="item__cnt">{{ giftName }}</span>
    <span class="item__name">{{ data.nn }}</span>
    <span v-if="Number(data.hits) >= 5" class="item__hits"
      >累计x{{ data.hits }}</span
    >
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { nobleData } from '@/global/utils/dydata/nobleData.js';
// 钻粉图片
const DIAMOND_URL =
  'https://shark2.douyucdn.cn/front-publish/live-player-aside-master/assets/images/diamonds_banner_logo_c077d7b.gif';
const GIFT_IMG_PREFIX = 'https://gfs-op.douyucdn.cn/dygift';
const FANS_LEVEL_UP =
  'https://shark2.douyucdn.cn/front-publish/live-anchor-title-master/assets/images/exp_ca09807.webp';
const DEFAULT_GIFT_URL =
  'https://gfs-op.douyucdn.cn/dygift/propFile/douyu/2020/03/11/33071b20d692f070a4b32010a8291272.png';

let props = defineProps([
  'data',
  'giftData',
  'mode',
  'showAnimation',
  'totalPrice',
]);

// 优化礼物图标URL计算
let avatarSrc = computed(() => {
  let ret = '';
  switch (props.data.type) {
    case '礼物':
      // 确保giftData和pic存在，否则使用默认礼物图标
      if (props.giftData && props.giftData.pic) {
        // 检查pic是否已经是完整URL，如果是则直接使用，否则加上前缀
        if (props.giftData.pic.startsWith('http')) {
          ret = props.giftData.pic;
        } else {
          ret = GIFT_IMG_PREFIX + props.giftData.pic;
        }
      } else {
        // 使用默认礼物图标
        ret = DEFAULT_GIFT_URL;
      }
      break;
    case '钻粉':
      ret = DIAMOND_URL;
      break;
    case '贵族':
      if (
        props.data.nl &&
        nobleData[props.data.nl] &&
        nobleData[props.data.nl].pic
      ) {
        ret = nobleData.prefix + nobleData[props.data.nl].pic;
      }
      break;
    case '粉丝牌升级':
      ret = FANS_LEVEL_UP;
      break;
    default:
      // 使用默认礼物图标
      ret = DEFAULT_GIFT_URL;
      break;
  }
  return ret;
});

// 优化礼物名称计算
let giftName = computed(() => {
  let ret = '';
  switch (props.data.type) {
    case '礼物':
      if (props.giftData && props.giftData.n) {
        ret = `${props.giftData.n}*${props.data.gfcnt}`;
      } else {
        // 当giftData不存在时，使用通用礼物名称
        ret = `礼物*${props.data.gfcnt || 1}`;
      }
      break;
    case '钻粉':
      ret = props.data.name || '钻粉'; // 确保有默认值
      break;
    case '贵族':
      ret = props.data.name || '贵族'; // 确保有默认值
      break;
    case '粉丝牌升级':
      ret = props.data.name || '粉丝牌升级'; // 确保有默认值
      break;
    default:
      ret = '礼物';
      break;
  }
  return ret;
});

function getItemClass(item) {
  let ret = '';
  switch (props.data.type) {
    case '礼物':
      // 检查giftData和pc属性是否存在
      if (
        props.giftData &&
        props.giftData.pc &&
        Number(props.giftData.pc) * Number(item.gfcnt) >=
          Number(props.totalPrice) * 100
      ) {
        if (props.mode === 'night') {
          ret = 'highlight-night';
        } else {
          ret = 'highlight-day';
        }
      }
      break;
    case '钻粉':
      if (props.mode === 'night') {
        ret = 'highlight-night';
      } else {
        ret = 'highlight-day';
      }
      break;
    case '贵族':
      if (props.mode === 'night') {
        ret = 'highlight-night';
      } else {
        ret = 'highlight-day';
      }
      break;
    case '粉丝牌升级':
      // 当粉丝牌升级大于10级则高亮
      if (item.bl > 10) {
        if (props.mode === 'night') {
          ret = 'highlight-night';
        } else {
          ret = 'highlight-day';
        }
      }
      break;
    default:
      break;
  }
  return ret;
}
</script>

<style lang="scss" scoped>
@use '@/global/styles/themes/index.scss' as *;
.item {
  vertical-align: middle;
  width: 100%;
  margin-bottom: 5px;
  padding: 0 4px;
  box-sizing: border-box;

  &:first-child {
    margin-top: 5px;
  }
  > * {
    vertical-align: middle;
    margin-right: 5px;
  }
  .item__gift {
    img {
      border-radius: 10%;
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }
  .item__fans {
    width: 60px;
  }
  .item__level {
    width: 40px;
    height: 16px;
  }
  .item__name {
    @include fontColor('nicknameColor');
  }
  .item__cnt {
    @include fontColor('contentColor');
  }
  .item__hits {
    @include fontColor('contentColor');
  }
}

.highlight-day {
  background-color: rgb(255, 243, 223);
}

.highlight-night {
  background-color: rgb(55, 55, 55);
  border-top: 1px solid rgb(90, 90, 90);
  border-bottom: 1px solid rgb(90, 90, 90);
}
</style>
