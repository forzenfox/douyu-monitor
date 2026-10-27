<template>
  <div class="lvjiang-config">
    <!-- 助手昵称 -->
    <div class="field-item">
      <div class="field-label">助手昵称</div>
      <div class="field-content">
        <input
          type="text"
          class="config-input"
          v-model="localOptions.assistantName"
          @input="handleOptionChange"
          placeholder="新驴酱团播小助手"
        />
      </div>
    </div>

    <!-- 团员名单 -->
    <div class="field-item members-item">
      <div class="field-label">团员名单</div>
      <div class="field-content">
        <div class="members">
          <div class="member-list">
            <span
              v-for="(member, index) in localOptions.members"
              :key="`${member}-${index}`"
              class="member-tag"
            >
              {{ member }}
              <button
                class="delete-btn"
                title="删除"
                @click="removeMember(index)"
              >
                ×
              </button>
            </span>
            <span v-if="localOptions.members.length === 0" class="member-empty">
              暂无团员
            </span>
          </div>
          <div class="add-member">
            <input
              type="text"
              class="config-input"
              v-model="newMember"
              @keyup.enter="addMember"
              placeholder="输入昵称，回车添加"
            />
            <button class="add-btn" @click="addMember">添加</button>
          </div>
          <p class="member-tip">
            用于解析消歧；纯数字昵称（如 145）必须加入，避免识别错误或遗漏
          </p>
        </div>
      </div>
    </div>

    <!-- 确认窗口 -->
    <div class="field-item">
      <div class="field-label">确认窗口</div>
      <div class="field-content">
        <input
          type="number"
          class="config-input small"
          min="1"
          step="1"
          v-model.number="localOptions.confirmTimeout"
          @input="handleOptionChange"
        />
        <span class="unit">秒</span>
      </div>
    </div>

    <!-- 确认耗时展示 -->
    <div class="field-item">
      <div class="field-label">确认耗时展示</div>
      <div class="field-content">
        <label class="switch-label">
          <input
            type="checkbox"
            class="switch-input"
            v-model="localOptions.showConfirmCost"
            @change="handleOptionChange"
          />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <!-- 点击置灰自动移除 -->
    <div class="field-item">
      <div class="field-label">点击置灰自动移除</div>
      <div class="field-content">
        <label class="switch-label">
          <input
            type="checkbox"
            class="switch-input"
            v-model="localOptions.autoRemoveHandled"
            @change="handleOptionChange"
          />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <!-- 自动移除时间 -->
    <div class="field-item">
      <div class="field-label">自动移除时间</div>
      <div class="field-content">
        <input
          type="number"
          class="config-input small"
          min="1"
          step="1"
          :disabled="!localOptions.autoRemoveHandled"
          v-model.number="localOptions.autoRemoveDelay"
          @input="handleOptionChange"
        />
        <span class="unit">秒</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:options']);

// 本地配置副本，用于实时编辑
const localOptions = ref(JSON.parse(JSON.stringify(props.options)));

// 新团员输入
const newMember = ref('');

// 监听 props 变化，同步本地副本
watch(
  () => props.options,
  newVal => {
    localOptions.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true }
);

const handleOptionChange = () => {
  emit('update:options', { ...localOptions.value });
};

const addMember = () => {
  const name = newMember.value.trim();
  if (!name) return;
  if (localOptions.value.members.includes(name)) {
    alert('该团员已存在');
    return;
  }
  localOptions.value.members.push(name);
  newMember.value = '';
  handleOptionChange();
};

const removeMember = index => {
  localOptions.value.members.splice(index, 1);
  handleOptionChange();
};
</script>

<style lang="scss" scoped>
.lvjiang-config {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

.field-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #ebedf0;

  [data-theme='night'] & {
    border-bottom-color: #3a3a3a;
  }

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.members-item {
  align-items: flex-start;
}

.field-label {
  width: 110px;
  font-size: 14px;
  color: #646566;
  font-weight: 500;
  white-space: nowrap;
  margin-right: 16px;
  text-align: left;
  line-height: 32px;

  [data-theme='night'] & {
    color: #b0b0b0;
  }
}

.field-content {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.config-input {
  flex: 1;
  max-width: 320px;
  padding: 8px 12px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  transition: all 0.3s ease;

  [data-theme='night'] & {
    background-color: #3a3a3a;
    border-color: #4a4a4a;
    color: #fff;
  }

  &:focus {
    outline: none;
    border-color: #1989fa;
  }

  &.small {
    flex: none;
    width: 90px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.unit {
  margin-left: 8px;
  font-size: 14px;
  color: #646566;

  [data-theme='night'] & {
    color: #b0b0b0;
  }
}

.members {
  width: 100%;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.member-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 14px;
  background-color: #f0f2f5;
  font-size: 13px;
  color: #333;

  [data-theme='night'] & {
    background-color: #3a3a3a;
    color: #eee;
  }
}

.member-empty {
  font-size: 13px;
  color: #969799;
}

.add-member {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-btn {
  padding: 8px 16px;
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: #40a9ff;
  }
}

.delete-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
}

.member-tip {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #969799;
}

/* 开关样式 */
.switch-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

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

  [data-theme='night'] & {
    background-color: #4a4a4a;
  }
}

.switch-slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: all 0.3s ease;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.switch-input:checked + .switch-slider {
  background-color: #1989fa;
}

.switch-input:checked + .switch-slider:before {
  transform: translateX(20px);
}

@media (max-width: 768px) {
  .field-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .field-label {
    width: auto;
    margin-right: 0;
    line-height: 1.5;
  }

  .field-content {
    width: 100%;
  }

  .config-input {
    max-width: none;
  }
}
</style>
