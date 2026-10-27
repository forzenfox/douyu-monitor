<template>
  <div class="user-danmaku-config">
    <!-- 已添加用户 -->
    <div class="field-item">
      <div class="field-label">已添加用户</div>
      <div class="field-content">
        <span v-if="localOptions.users.length === 0" class="empty-tip"
          >暂无指定用户，请在下方添加</span
        >
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <div v-for="user in localOptions.users" :key="user.id" class="user-item">
        <div class="field-item">
          <div class="field-label"></div>
          <div class="field-content">
            <div class="user-info">
              <input
                type="checkbox"
                class="user-checkbox"
                v-model="user.enabled"
                @change="handleOptionChange"
              />
              <span class="user-name">{{ user.name }}</span>
              <button
                class="delete-btn"
                @click="deleteUser(user.id)"
                title="删除"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加用户 -->
    <div class="add-user-section">
      <div class="field-item">
        <div class="field-label">添加用户</div>
        <div class="field-content">
          <div class="add-user-input">
            <input
              type="text"
              class="add-user-input-field"
              v-model="newUserName"
              @keyup.enter="addUser"
              placeholder="输入斗鱼昵称，回车添加"
            />
            <button class="add-btn" @click="addUser">添加</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 灰置弹幕自动删除 -->
    <div class="field-item">
      <div class="field-label">灰置弹幕自动删除</div>
      <div class="field-content">
        <label class="switch-label">
          <input
            type="checkbox"
            class="auto-remove-switch"
            v-model="localOptions.autoRemoveExpired"
            @change="handleOptionChange"
          />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <!-- 灰置弹幕自动移除时间 -->
    <div class="field-item">
      <div class="field-label">自动移除时间</div>
      <div class="field-content">
        <div class="auto-remove-delay-wrapper">
          <input
            type="number"
            class="auto-remove-delay"
            min="1"
            step="1"
            :disabled="!localOptions.autoRemoveExpired"
            v-model.number="localOptions.autoRemoveDelay"
            @input="handleOptionChange"
          />
          <span class="auto-remove-unit">秒</span>
        </div>
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
const localOptions = ref(JSON.parse(JSON.stringify(props.options.userDanmaku)));
// 新用户名输入
const newUserName = ref('');

// 监听 props 变化，同步本地配置
watch(
  () => props.options.userDanmaku,
  newVal => {
    localOptions.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true }
);

// 派发配置更新
const handleOptionChange = () => {
  emit('update:options', {
    ...props.options,
    userDanmaku: JSON.parse(JSON.stringify(localOptions.value)),
  });
};

// 添加用户
const addUser = () => {
  const name = newUserName.value.trim();
  if (!name) return;

  const exists = localOptions.value.users.some(
    user => user.name.trim() === name
  );
  if (exists) {
    alert('该用户已存在');
    return;
  }

  localOptions.value.users.push({
    id: `user-${Date.now()}`,
    name,
    enabled: true,
  });
  newUserName.value = '';
  handleOptionChange();
};

// 删除用户
const deleteUser = id => {
  localOptions.value.users = localOptions.value.users.filter(
    user => user.id !== id
  );
  handleOptionChange();
};
</script>

<style lang="scss" scoped>
.user-danmaku-config {
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

.field-label {
  width: 100px;
  font-size: 14px;
  color: #646566;
  font-weight: 500;
  white-space: nowrap;
  margin-right: 16px;
  text-align: left;

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

/* 灰置弹幕自动删除开关 */
.switch-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.auto-remove-switch {
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

  [data-theme='night'] & {
    background-color: #3a3a3a;
  }
}

.auto-remove-switch:checked + .switch-slider {
  background-color: #1989fa;
}

.auto-remove-switch:checked + .switch-slider:before {
  transform: translateX(20px);
  background-color: white;

  [data-theme='night'] & {
    background-color: #fff;
  }
}

[data-theme='night'] .auto-remove-switch:checked + .switch-slider {
  background-color: #40a9ff;
}

/* 灰置弹幕自动移除时间输入 */
.auto-remove-delay-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auto-remove-delay {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fff;
  text-align: center;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.auto-remove-unit {
  font-size: 14px;
  color: #646566;

  [data-theme='night'] & {
    color: #b0b0b0;
  }
}

.empty-tip {
  font-size: 14px;
  color: #909399;

  [data-theme='night'] & {
    color: #999;
  }
}

.user-list {
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  justify-content: flex-start;
}

.user-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 80px;

  [data-theme='night'] & {
    color: #fff;
  }
}

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
  }
}

.add-user-section {
  margin-bottom: 20px;
}

.add-user-input {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.add-user-input-field {
  flex: 1;
  max-width: 300px;
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
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background-color: #40a9ff;
  }
}

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

  .add-user-input {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .add-user-input-field {
    width: 100%;
    max-width: none;
  }

  .add-btn {
    width: 100%;
  }
}
</style>
