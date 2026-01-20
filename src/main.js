import { createApp } from 'vue'
import App from './App.vue'

// import '@vant/touch-emulator' // 注释掉触摸模拟器引入，仅在开发环境中需要

// 引入全局样式
import "@/global/styles/index.scss"
// 引入Vant全局样式
import 'vant/lib/index.css'

import { parseUrl } from "./router.js"

async function initApp() {
    let info = await parseUrl();
    window.rid = info.rid;
    window.options = info.options;
    // logInfo(); // 注释掉日志函数调用，避免在生产环境中打印项目信息
    createApp(App).mount('#app')
}

initApp();


function logInfo() {
    console.log(`%c
   ______                    _____)
  (, /    )                /
    /    / ___             )__   __/
  _/___ /_(_)(_(_(_/_(_(_/        /(__
(_/___ /        .-/     (_____)  /
               (_/

%cContact: 小淳 189964430@qq.com`,'color:rgb(255,121,35);font-size:20px;font-weight:bold;', "color:blue;font-size:16px;")
    return;
}