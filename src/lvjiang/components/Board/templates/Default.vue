<template>
  <div
    class="lvjiang-item"
    :class="[
      typeClass,
      `status-${data.status}`,
      { 'lvjiang-item--handled': data.isHandled },
    ]"
    @click.stop="$emit('click')"
  >
    <div class="item-row">
      <span class="boss">{{ data.boss }}</span>
      <span class="raw-text">{{ data.rawText }}</span>
      <span class="time">{{ timeText }}</span>
      <span class="status">
        <span class="status-icon">{{ statusIcon }}</span>
        <span class="status-text">{{ statusText }}</span>
        <span v-if="showCost" class="confirm-cost">{{ costText }}</span>
      </span>
    </div>
    <div v-if="canShowDetail" class="confirm-detail">{{ detailText }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  showConfirmCost: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['click']);

const STATUS_ICON = {
  pending: '⏳',
  valid: '✓',
  unconfirmed: '—',
};
const STATUS_TEXT = {
  pending: '待确认',
  valid: '有效',
  unconfirmed: '未确认',
};

const typeClass = computed(() =>
  props.data.type === 'bomb' ? 'type-bomb' : 'type-give'
);

const statusIcon = computed(() => STATUS_ICON[props.data.status] || '');
const statusText = computed(() => STATUS_TEXT[props.data.status] || '');

const timeText = computed(() => {
  const date = new Date(props.data.timestamp);
  const pad = value => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
});

const canShowDetail = computed(
  () => props.data.status === 'valid' && !!props.data.confirmInfo
);

const detailText = computed(() => {
  const info = props.data.confirmInfo;
  if (!info) return '';
  const label = props.data.type === 'bomb' ? '炸' : '转给';
  return `${label}${props.data.member} ${info.value} · 剩余 ${info.remaining}`;
});

const showCost = computed(
  () =>
    props.showConfirmCost &&
    props.data.status === 'valid' &&
    props.data.confirmedAt != null
);

const costText = computed(() => {
  if (!showCost.value) return '';
  const seconds = Math.max(
    0,
    Math.round((props.data.confirmedAt - props.data.timestamp) / 1000)
  );
  return `+${seconds}s`;
});
</script>

<style lang="scss" scoped>
@use '@/global/styles/themes/index.scss' as *;

.lvjiang-item {
  @include fontColor('txtColor');
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 2px solid transparent;
  border-left-width: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  :deep(.day) & {
    background-color: rgba(255, 255, 255, 0.9);
  }

  :deep(.night) & {
    background-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  // 给分：暖橙色系；炸分：冷紫蓝色系
  &.type-give {
    border-left-color: #ff9800;
  }

  &.type-bomb {
    border-left-color: #7c4dff;
  }

  .item-row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  .boss {
    font-weight: bold;
    @include fontColor('nicknameColor');
    flex-shrink: 0;
    max-width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .raw-text {
    flex: 1;
    font-weight: bold;
    word-break: break-all;
    min-width: 0;
  }

  &.type-give .raw-text {
    color: #ff9800;
  }

  &.type-bomb .raw-text {
    color: #7c4dff;
  }

  .time {
    flex-shrink: 0;
    font-size: 0.85em;
    opacity: 0.7;
  }

  .status {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85em;
    font-weight: bold;
  }

  .confirm-cost {
    opacity: 0.8;
    font-weight: normal;
  }

  .confirm-detail {
    margin-top: 4px;
    font-size: 0.85em;
    opacity: 0.8;
    padding-left: 2px;
  }

  // 状态样式
  &.status-pending .status {
    color: #e6a23c;
  }

  &.status-valid .status {
    color: #52c41a;
  }

  &.status-unconfirmed {
    opacity: 0.5;

    .status {
      color: #909399;
    }
  }

  // 手动置灰（已处理）
  &.lvjiang-item--handled {
    opacity: 0.55;
    transform: scale(0.99);

    :deep(.day) & {
      background-color: rgba(240, 240, 240, 0.9);
    }

    :deep(.night) & {
      background-color: rgba(20, 20, 20, 0.3);
    }
  }
}
</style>
