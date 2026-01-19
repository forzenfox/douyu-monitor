<template>
    <div class="app-container">
        <template v-if="!hasError">
            <Monitor @error="handleError"></Monitor>
        </template>
        <div v-else class="error-container">
            <div class="error-content">
                <h1 class="error-title">应用发生错误</h1>
                <div class="error-message">{{ errorMessage }}</div>
                <button class="reload-button" @click="reloadApp">重新加载</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Monitor from "./monitor/pages/index.vue"

// 错误状态
const hasError = ref(false)
const errorMessage = ref('')

/**
 * 处理子组件抛出的错误
 * @param {Error} error - 错误对象
 * @param {Component} instance - 发生错误的组件实例
 * @param {string} info - 错误信息
 */
function handleError(error, instance, info) {
    console.error('组件错误:', error, instance, info)
    hasError.value = true
    errorMessage.value = error.message || '未知错误'
    // 阻止错误继续传播
    return false
}

/**
 * 重新加载应用
 */
function reloadApp() {
    location.reload()
}

onMounted(() => {
    // 注册全局错误处理
    const app = document.querySelector('#app').__vue_app__
    if (app) {
        app.config.errorHandler = (error, instance, info) => {
            console.error('全局错误:', error, instance, info)
            hasError.value = true
            errorMessage.value = error.message || '未知错误'
        }
        
        // 注册未捕获的Promise错误处理
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未捕获的Promise错误:', event.reason)
            hasError.value = true
            errorMessage.value = event.reason.message || '未知Promise错误'
            event.preventDefault()
        })
        
        // 注册全局脚本错误处理
        window.addEventListener('error', (event) => {
            console.error('全局脚本错误:', event.error)
            hasError.value = true
            errorMessage.value = event.error.message || '未知脚本错误'
        })
    }
})
</script>

<style scoped>
.app-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
}

.error-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    color: #333;
    font-family: Arial, sans-serif;
}

.error-content {
    text-align: center;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 90%;
}

.error-title {
    font-size: 24px;
    margin-bottom: 20px;
    color: #ff4d4f;
}

.error-message {
    font-size: 16px;
    margin-bottom: 30px;
    color: #666;
    word-break: break-word;
}

.reload-button {
    padding: 10px 30px;
    font-size: 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.reload-button:hover {
    background-color: #40a9ff;
}

.reload-button:active {
    background-color: #096dd9;
}
</style>