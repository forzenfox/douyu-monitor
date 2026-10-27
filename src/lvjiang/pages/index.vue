<template>
  <div class="lvjiang" @click.prevent="onClickPage" ref="domPage">
    <!-- 连接状态指示器 -->
    <div
      class="connection-status"
      :class="{ connected: isConnected, disconnected: !isConnected }"
    >
      <div class="status-indicator"></div>
      <span class="status-text">{{
        isConnected ? '已连接' : `连接中...(${reconnectCount}次)`
      }}</span>
    </div>

    <Board :options="options" :commandList="commandList"></Board>
  </div>

  <Popup
    class="popup"
    v-model:show="isShowOption"
    position="bottom"
    :style="{ height: '50%' }"
  >
    <div class="popup-top">
      <div @click="onClickChangeMode">
        <svg
          v-if="options.mode === 'night'"
          viewBox="0 0 1024 1024"
          width="24"
          height="24"
        >
          <path
            d="M487.204571 67.474286A444.525714 444.525714 0 1 1 92.16 715.373714a357.778286 357.778286 0 1 0 296.96-636.708571c32.182857-7.350857 65.097143-11.081143 98.084571-11.190857z"
            fill="#8a8a8a"
          ></path>
        </svg>
        <svg v-else viewBox="0 0 1024 1024" width="24" height="24">
          <path
            d="M438.857 73.143c0-40.396 32.466-73.143 73.143-73.143 40.396 0 73.143 32.466 73.143 73.143v73.143h-146.286v-73.143zM438.857 877.714h146.286v73.143c0 40.396-32.466 73.143-73.143 73.143-40.396 0-73.143-32.466-73.143-73.143v-73.143zM73.143 585.143c-40.396 0-73.143-32.466-73.143-73.143 0-40.396 32.466-73.143 73.143-73.143h73.143v146.286h-73.143zM877.714 585.143v-146.286h73.143c40.396 0 73.143 32.466 73.143 73.143 0 40.396-32.466 73.143-73.143 73.143h-73.143zM149.961 253.401c-28.564-28.564-28.763-74.676 0-103.44 28.564-28.564 74.676-28.763 103.44 0l51.719 51.719-103.44 103.44-51.722-51.719zM718.879 822.319l103.44-103.44 51.719 51.722c28.564 28.564 28.763 74.676 0 103.44-28.564 28.564-74.676 28.763-103.44 0l-51.719-51.719zM253.401 874.039c-28.564 28.564-74.676 28.763-103.44 0-28.564-28.564-28.763-74.676 0-103.44l51.719-51.719 103.44 103.44-51.719 51.722zM822.319 305.121l-103.44-103.44 51.722-51.719c28.564-28.564 74.676-28.763 103.44 0 28.564 28.564 28.763 74.676 0 103.44l-51.719 51.719zM512 804.571c161.583 0 292.571-130.989 292.571-292.571 0-161.583-130.989-292.571-292.571-292.571-161.583 0-292.571 130.989-292.571 292.571 0 161.583 130.989 292.571 292.571 292.571z"
            fill="#8a8a8a"
          ></path>
        </svg>
      </div>
      <div @click="onClickRestOptions">
        <svg viewBox="0 0 1024 1024" width="24" height="24">
          <path
            d="M890.092308 988.002462a37.257846 37.257846 0 0 1-25.67877-27.72677c-53.326769-236.937846-209.526154-305.467077-408.576-368.64l-55.847384 182.744616a37.415385 37.415385 0 0 1-67.741539 8.428307L65.851077 353.516308a37.257846 37.257846 0 0 1 15.281231-53.090462L549.021538 70.656a37.257846 37.257846 0 0 1 40.96 5.198769 37.651692 37.651692 0 0 1 11.500308 39.384616l-47.261538 154.702769c92.317538 34.264615 169.905231 87.985231 230.636307 159.901538 54.429538 64.275692 95.310769 142.966154 121.619693 233.787077 42.771692 147.692308 33.004308 277.897846 31.744 292.312616v0.157538a37.336615 37.336615 0 0 1-34.816 33.634462 40.329846 40.329846 0 0 1-13.39077-1.732923zM352.492308 673.476923l42.692923-139.657846a37.494154 37.494154 0 0 1 46.710154-24.733539c129.969231 39.778462 233.314462 78.769231 314.998153 140.288 35.052308 26.151385 65.851077 56.871385 91.766154 91.608616a733.026462 733.026462 0 0 0-14.493538-58.683077c-53.563077-182.114462-166.990769-300.819692-337.289846-352.886154a38.281846 38.281846 0 0 1-22.291693-18.432 36.312615 36.312615 0 0 1-2.599384-28.356923l32.610461-106.653538-353.28 173.292307L352.492308 673.476923z"
            fill="#8a8a8a"
          ></path>
        </svg>
      </div>
    </div>
    <Tabs v-model:active="activeTab">
      <Tab title="通用">
        <Field label="字号">
          <template #input>
            <Slider v-model="options.fontSize" :min="12" :max="30" />
          </template>
        </Field>
        <Field label="动画">
          <template #input>
            <Switch v-model="options.animation" size="20" />
          </template>
        </Field>
        <Field
          v-model="options.threshold"
          label="消息上限"
          type="digit"
          placeholder="当超过上限 旧数据会被删除"
        ></Field>
      </Tab>
      <Tab title="团播看板">
        <BoardConfig :options="options" @update:options="onUpdateOptions" />
      </Tab>
    </Tabs>
  </Popup>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

import Board from '../components/Board/Board.vue';
import BoardConfig from '../components/Board/BoardConfig.vue';

import { Popup, Tab, Tabs, Field, Slider, Switch, Dialog } from 'vant';

import { useNormalStyle } from '@/monitor/hooks/useNormalStyle.js';
import { useLvjiangWs } from '../hooks/useLvjiangWs.js';

import {
  saveLocalData,
  getLocalData,
  deepCopy,
  formatObj,
} from '@/global/utils';
import { defaultLvjiangOptions, LOCAL_NAME, DEFAULT_RID } from '../options.js';

const domPage = ref(null);
const options = ref(deepCopy(defaultLvjiangOptions));
const isShowOption = ref(false);
const activeTab = ref(0);

const { fontSizeStyle } = useNormalStyle(options);
const { connectWs, commandList, isConnected, reconnectCount } =
  useLvjiangWs(options);

function onClickPage() {
  isShowOption.value = true;
}

function onClickChangeMode() {
  options.value.mode = options.value.mode === 'night' ? 'day' : 'night';
}

function onClickRestOptions() {
  Dialog.confirm({
    title: '提示',
    message: '确认恢复默认设置？',
  })
    .then(() => {
      options.value = deepCopy(defaultLvjiangOptions);
    })
    .catch(() => {});
}

function onUpdateOptions(newOptions) {
  options.value = newOptions;
}

onMounted(() => {
  // 读取本地配置（独立存储键），并按默认模板补齐缺失字段
  let localData = JSON.parse(getLocalData(LOCAL_NAME));
  if (Object.prototype.toString.call(localData) !== '[object Object]') {
    localData = deepCopy(defaultLvjiangOptions);
  }
  options.value = formatObj(localData, defaultLvjiangOptions);

  const rid = window.rid || DEFAULT_RID;
  connectWs(rid);

  document.title = '驴酱青春团 - 团播温度值看板';
});

watch(
  options,
  n => {
    saveLocalData(LOCAL_NAME, JSON.stringify(n));
  },
  { deep: true }
);

watch(
  () => options.value.mode,
  n => {
    if (n === 'night') {
      window.document.documentElement.setAttribute('data-theme', 'night');
    } else {
      window.document.documentElement.setAttribute('data-theme', 'day');
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
@use '@/global/styles/themes/index.scss' as *;

.lvjiang {
  @include backgroundColor('backgroundColor');
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: v-bind(fontSizeStyle);
  user-select: none;
  transition: all 0.3s ease;
}

.popup {
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;

  .popup-top {
    user-select: none;
    height: 56px;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #f0f0f0;
    background: #ffffff;

    > div {
      width: 32px;
      height: 32px;
      margin-left: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;

      &:hover {
        background-color: #f5f5f5;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
}

/* 连接状态指示器样式 */
.connection-status {
  position: fixed;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: 500;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &.connected {
    background-color: rgba(24, 144, 255, 0.7);

    .status-indicator {
      background-color: #52c41a;
    }
  }

  &.disconnected {
    background-color: rgba(255, 77, 79, 0.7);

    .status-indicator {
      background-color: #ff4d4f;
    }
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-text {
    font-size: 12px;
    font-weight: 500;
  }
}

[data-theme='night'] {
  .popup {
    background: #1e1e1e;

    .popup-top {
      background: #2a2a2a;
      border-bottom-color: #3a3a3a;

      > div:hover {
        background-color: #3a3a3a;
      }
    }
  }

  .connection-status {
    background-color: rgba(58, 58, 58, 0.9);

    &.connected {
      background-color: rgba(64, 158, 255, 0.9);
    }

    &.disconnected {
      background-color: rgba(255, 77, 79, 0.9);
    }
  }
}
</style>
