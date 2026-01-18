<template>
    <div class="monitor" @click.prevent="onClickMonitor" ref="domMonitor">
        <Enter v-if="options.switch.includes('enter')" :maxOrder="maxOrder" :options="options" :enterList="enterList"></Enter>
        <Gift v-if="options.switch.includes('gift')" :maxOrder="maxOrder" :options="options" :giftList="giftList" :allGiftData="allGiftData"></Gift>
        <Superchat v-if="options.switch.includes('superchat')" :maxOrder="maxOrder" :options="options" :superchatList="superchatList"></Superchat>
        <Danmaku v-if="options.switch.includes('danmaku')" :maxOrder="maxOrder" :options="options" :danmakuList="danmakuList"></Danmaku>
        <CommandDanmaku v-if="options.switch.includes('commandDanmaku')" :maxOrder="maxOrder" :options="options" :commandDanmakuList="commandDanmakuList"></CommandDanmaku>
    </div>
    <Popup class="popup" v-model:show="isShowOption" position="bottom" :style="{ height: '50%' }">
        <div class="popup-top">
            <div class="douyuex">
                <a href="https://xiaochunchun.gitee.io/douyuex/" target="_blank">
                    <svg t="1637284063150" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2978" width="24" height="24"><path d="M1006.1 412.7l-187.5-141c0-0.2 0.1-0.3 0.1-0.4V121.4c0-2.3-1.9-4.2-4.2-4.2h-92.4c-2.3 0-4.2 1.9-4.2 4.2V196L535.3 58.8c-7.3-5.5-16-8.4-25.1-8.4-9.2 0-17.9 2.9-25.2 8.5L16.7 412.5C7.8 419.2 2.1 429 0.5 440.1c-2.1 14.8 3.8 29.5 16.2 39.3 4.3 3.3 9.2 5.7 14.5 7 13 3.2 25.8 0.6 36-7.1L505 148.6c3.1-2.3 7.4-2.3 10.4 0l441.8 332c7.3 5.5 16 8.4 25.1 8.4 13.7 0 26.3-6.5 34.2-17.7 13.3-18.8 7.9-44.9-10.4-58.6z" p-id="2979" fill="#8a8a8a"></path><path d="M906.7 499.4l-193.2-140-196.7-142.5c-3.4-2.5-8.1-2.5-11.5 0L308.7 359.4l-193.2 140c-5.6 4.1-9 10.6-9 17.6v392.1c0 35.5 29 64.5 64.5 64.5h246.7V716.2c0-30 24.6-54.6 54.6-54.6h77.5c30 0 54.6 24.6 54.6 54.6v257.4h246.7c35.5 0 64.5-29 64.5-64.5V517c0.1-6.9-3.3-13.5-8.9-17.6z" p-id="2980" fill="#8a8a8a"></path></svg>
                </a>
            </div>
            <div class="github">
                <a href="https://github.com/qianjiachun/douyu-monitor/tree/main/vue" target="_blank"><svg t="1636974784707" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7184" width="24" height="24"><path d="M511.957333 21.333333C241.024 21.333333 21.333333 240.981333 21.333333 512c0 216.832 140.544 400.725333 335.573334 465.664 24.490667 4.394667 32.256-10.069333 32.256-23.082667 0-11.690667 0.256-44.245333 0-85.205333-136.448 29.610667-164.736-64.64-164.736-64.64-22.314667-56.704-54.4-71.765333-54.4-71.765333-44.586667-30.464 3.285333-29.824 3.285333-29.824 49.194667 3.413333 75.178667 50.517333 75.178667 50.517333 43.776 75.008 114.816 53.333333 142.762666 40.789333 4.522667-31.658667 17.152-53.376 31.189334-65.536-108.970667-12.458667-223.488-54.485333-223.488-242.602666 0-53.546667 19.114667-97.322667 50.517333-131.669334-5.034667-12.330667-21.930667-62.293333 4.778667-129.834666 0 0 41.258667-13.184 134.912 50.346666a469.802667 469.802667 0 0 1 122.88-16.554666c41.642667 0.213333 83.626667 5.632 122.88 16.554666 93.653333-63.488 134.784-50.346667 134.784-50.346666 26.752 67.541333 9.898667 117.504 4.864 129.834666 31.402667 34.346667 50.474667 78.122667 50.474666 131.669334 0 188.586667-114.730667 230.016-224.042666 242.090666 17.578667 15.232 33.578667 44.672 33.578666 90.453334v135.850666c0 13.141333 7.936 27.605333 32.853334 22.869334C862.250667 912.597333 1002.666667 728.746667 1002.666667 512 1002.666667 240.981333 783.018667 21.333333 511.957333 21.333333z" p-id="7185" fill="#8a8a8a"></path></svg></a>
            </div>
            <div @click="onClickChangeMode">
                <svg v-if="options.mode === 'night'" t="1636947364663" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17884" width="24" height="24"><path d="M487.204571 67.474286A444.525714 444.525714 0 1 1 92.16 715.373714a357.778286 357.778286 0 1 0 296.96-636.708571c32.182857-7.350857 65.097143-11.081143 98.084571-11.190857z" p-id="17885" fill="#8a8a8a"></path></svg>
                <svg v-else t="1636947463842" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20823" width="24" height="24"><path d="M438.857 73.143c0-40.396 32.466-73.143 73.143-73.143 40.396 0 73.143 32.466 73.143 73.143v73.143h-146.286v-73.143zM438.857 877.714h146.286v73.143c0 40.396-32.466 73.143-73.143 73.143-40.396 0-73.143-32.466-73.143-73.143v-73.143zM73.143 585.143c-40.396 0-73.143-32.466-73.143-73.143 0-40.396 32.466-73.143 73.143-73.143h73.143v146.286h-73.143zM877.714 585.143v-146.286h73.143c40.396 0 73.143 32.466 73.143 73.143 0 40.396-32.466 73.143-73.143 73.143h-73.143zM149.961 253.401c-28.564-28.564-28.763-74.676 0-103.44 28.564-28.564 74.676-28.763 103.44 0l51.719 51.719-103.44 103.44-51.722-51.719zM718.879 822.319l103.44-103.44 51.719 51.722c28.564 28.564 28.763 74.676 0 103.44-28.564 28.564-74.676 28.763-103.44 0l-51.719-51.719zM253.401 874.039c-28.564 28.564-74.676 28.763-103.44 0-28.564-28.564-28.763-74.676 0-103.44l51.719-51.719 103.44 103.44-51.719 51.722zM822.319 305.121l-103.44-103.44 51.722-51.719c28.564-28.564 74.676-28.763 103.44 0 28.564 28.564 28.763 74.676 0 103.44l-51.719 51.719zM512 804.571c161.583 0 292.571-130.989 292.571-292.571 0-161.583-130.989-292.571-292.571-292.571-161.583 0-292.571 130.989-292.571 292.571 0 161.583 130.989 292.571 292.571 292.571z" p-id="20824" fill="#8a8a8a"></path></svg>
            </div>
            <div @click="onClickShare">
                <svg t="1637380837755" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2733" width="24" height="24"><path d="M380.36396 566.298587l300.553318 205.558677a149.295574 149.295574 0 1 1-38.731537 76.865893L338.262608 640.818406a149.295574 149.295574 0 1 1-13.180667-226.374746l318.938002-230.299087a149.295574 149.295574 0 1 1 43.082437 74.093261L375.501189 483.418215a149.039639 149.039639 0 0 1 4.905426 82.923028zM789.263209 213.406506a63.983817 63.983817 0 1 0 0-127.967635 63.983817 63.983817 0 0 0 0 127.967635z m0 725.149931a63.983817 63.983817 0 1 0 0-127.967635 63.983817 63.983817 0 0 0 0 127.967635z m-554.526418-341.247027a63.983817 63.983817 0 1 0 0-127.967634 63.983817 63.983817 0 0 0 0 127.967634z" fill="#8A8A8A" p-id="2734"></path></svg>
            </div>
            <div @click="onClickRestOptions">
                <svg t="1636947206527" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14990" width="24" height="24"><path d="M890.092308 988.002462a37.257846 37.257846 0 0 1-25.67877-27.72677c-53.326769-236.937846-209.526154-305.467077-408.576-368.64l-55.847384 182.744616a37.415385 37.415385 0 0 1-67.741539 8.428307L65.851077 353.516308a37.257846 37.257846 0 0 1 15.281231-53.090462L549.021538 70.656a37.257846 37.257846 0 0 1 40.96 5.198769 37.651692 37.651692 0 0 1 11.500308 39.384616l-47.261538 154.702769c92.317538 34.264615 169.905231 87.985231 230.636307 159.901538 54.429538 64.275692 95.310769 142.966154 121.619693 233.787077 42.771692 147.692308 33.004308 277.897846 31.744 292.312616v0.157538a37.336615 37.336615 0 0 1-34.816 33.634462 40.329846 40.329846 0 0 1-13.39077-1.732923zM352.492308 673.476923l42.692923-139.657846a37.494154 37.494154 0 0 1 46.710154-24.733539c129.969231 39.778462 233.314462 78.769231 314.998153 140.288 35.052308 26.151385 65.851077 56.871385 91.766154 91.608616a733.026462 733.026462 0 0 0-14.493538-58.683077c-53.563077-182.114462-166.990769-300.819692-337.289846-352.886154a38.281846 38.281846 0 0 1-22.291693-18.432 36.312615 36.312615 0 0 1-2.599384-28.356923l32.610461-106.653538-353.28 173.292307L352.492308 673.476923z" fill="#8a8a8a" p-id="14991"></path></svg>
            </div>
            <div @click="onClickSaveData">
                <svg t="1641663017225" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3820" width="24" height="24"><path d="M941.248 352L672 82.752A64 64 0 0 0 626.752 64H128a64 64 0 0 0-64 64v768a64 64 0 0 0 64 64h768a64 64 0 0 0 64-64V397.248A64 64 0 0 0 941.248 352zM256 128h48v160H256V128z m112 0H512v160h-144V128zM256 896v-192h512v192H256z m640 0h-64v-224a32 32 0 0 0-32-32H224a32 32 0 0 0-32 32v224H128V128h64v192a32 32 0 0 0 32 32h320a32 32 0 0 0 32-32V128h50.752L896 397.248V896z" p-id="3821" fill="#8a8a8a"></path></svg>
            </div>
        </div>
        <Tabs v-model:active="activeTab">
            <Tab title="通用">
                <Field label="布局">
                    <template #input>
                        <CheckboxGroup v-model="options.switch" direction="horizontal" @change="onChangeSwitch">
                            <Checkbox name="enter" shape="square">进场</Checkbox>
                            <Checkbox name="gift" shape="square">礼物</Checkbox>
                            <Checkbox name="danmaku" shape="square">弹幕</Checkbox>
                            <Checkbox name="superchat" shape="square">超级弹幕</Checkbox>
                            <Checkbox name="commandDanmaku" shape="square">指令弹幕</Checkbox>
                        </CheckboxGroup>
                    </template>
                </Field>
                <Field label="方向">
                    <template #input>
                        <RadioGroup v-model="options.direction" direction="horizontal">
                            <Radio name="column">纵向</Radio>
                            <Radio name="row">横向</Radio>
                        </RadioGroup>
                        <RadioGroup v-model="options.align" direction="horizontal">
                            <Radio name="left">左对齐</Radio>
                            <Radio name="right">右对齐</Radio>
                        </RadioGroup>
                    </template>
                </Field>
                <Field label="字号">
                    <template #input>
                        <Slider v-model="options.fontSize" :min="12" :max="30"/>
                    </template>
                </Field>
                <Field label="背景透明">
                    <template #input>
                        <Switch v-model="options.transparent" size="20" />
                    </template>
                </Field>
                <Field label="动画">
                    <template #input>
                        <Switch v-model="options.animation" size="20" />
                    </template>
                </Field>
                <Field v-model="options.threshold" label="数据上限" type="digit" placeholder="当超过上限 旧数据会被删除"></Field>
                <Field label="数据保存">
                    <template #input>
                        <Switch v-model="options.isSaveData" size="20" />
                    </template>
                </Field>
            </Tab>
            <Tab title="弹幕">
                <Field label="占比">
                    <template #input>
                        <Slider v-model="options.size.danmaku" :disabled="maxOrder===options.order.danmaku"/>
                    </template>
                </Field>
                <Field label="显示">
                    <template #input>
                        <CheckboxGroup v-model="options.danmaku.show" direction="horizontal">
                            <Checkbox name="level" shape="square">等级</Checkbox>
                            <Checkbox name="noble" shape="square">贵族</Checkbox>
                            <Checkbox name="fans" shape="square">粉丝牌</Checkbox>
                            <Checkbox name="avatar" shape="square">头像</Checkbox>
                            <Checkbox name="roomAdmin" shape="square">房管</Checkbox>
                            <Checkbox name="diamond" shape="square">钻粉</Checkbox>
                            <Checkbox name="color" shape="square">颜色</Checkbox>
                            <Checkbox name="vip" shape="square">VIP</Checkbox>
                        </CheckboxGroup>
                    </template>
                </Field>
                <Field v-model="options.danmaku.ban.level" label="屏蔽等级≤" type="digit" placeholder="请输入屏蔽的等级"></Field>
                <Field v-model="options.danmaku.ban.keywords" label="屏蔽关键词" placeholder="空格隔开 例如:弹幕1 弹幕2"></Field>
                <Field v-model="options.danmaku.ban.nicknames" label="屏蔽昵称" placeholder="模糊匹配 空格隔开 例如:昵称1 昵称2"></Field>
                <Field label="过滤重复">
                    <template #input>
                        <Switch v-model="options.danmaku.ban.isFilterRepeat" size="20" />
                    </template>
                </Field>
            </Tab>
            <Tab title="礼物">
                <Field label="占比">
                    <template #input>
                        <Slider v-model="options.size.gift" :disabled="maxOrder===options.order.gift"/>
                    </template>
                </Field>
                <Field v-model="options.gift.ban.price" label="屏蔽单价<" type="number" placeholder="请输入单价"></Field>
                <Field v-model="options.gift.totalPrice" label="高亮总价≥" type="number" placeholder="请输入总价"></Field>
                <Field v-model="options.gift.ban.keywords" label="屏蔽关键词" placeholder="空格隔开 例如:荧光棒 鱼丸"></Field>
                <Field v-model="options.gift.ban.fansLevel" label="粉丝牌等级≥" type="number" placeholder="屏蔽粉丝牌等级"></Field>
            </Tab>
            <Tab title="进场">
                <Field label="占比">
                    <template #input>
                        <Slider v-model="options.size.enter" :disabled="maxOrder===options.order.enter"/>
                    </template>
                </Field>
                <Field label="显示">
                    <template #input>
                        <CheckboxGroup v-model="options.enter.show" direction="horizontal">
                            <Checkbox name="level" shape="square">等级</Checkbox>
                            <Checkbox name="noble" shape="square">贵族</Checkbox>
                            <Checkbox name="avatar" shape="square">头像</Checkbox>
                        </CheckboxGroup>
                    </template>
                </Field>
                <Field v-model="options.enter.keywords" label="关键昵称" placeholder="空格隔开 例如:昵称1 昵称2"></Field>
                <Field v-model="options.enter.ban.level" label="屏蔽等级≤" type="digit" placeholder="请输入屏蔽的等级"></Field>
            </Tab>
            <Tab title="超级弹幕">
                <Field label="占比">
                    <template #input>
                        <Slider v-model="options.size.superchat" :disabled="maxOrder===options.order.superchat"/>
                    </template>
                </Field>
                <Field v-model="options.superchat.keyword" label="关键词" placeholder="请输入超级弹幕关键词"></Field>
                <Field label="显示">
                    <template #input>
                        <CheckboxGroup v-model="options.superchat.show" direction="horizontal">
                            <Checkbox name="fans" shape="square">粉丝牌</Checkbox>
                            <Checkbox name="noble" shape="square">贵族</Checkbox>
                            <Checkbox name="roomAdmin" shape="square">房管</Checkbox>
                            <Checkbox name="diamond" shape="square">钻粉</Checkbox>
                            <Checkbox name="time" shape="square">时间</Checkbox>
                        </CheckboxGroup>
                    </template>
                </Field>
                <Field label="语音播报">
                    <template #input>
                        <Switch v-model="options.superchat.speak" size="20" />
                    </template>
                </Field>
                <Field label="价格等级配置" readonly>
                    <template #input>
                        <div class="superchat-price-levels">
                            <div v-for="(item, index) in options.superchat.options" :key="index" class="superchat-price-level-item">
                                <div class="superchat-price-level-info">
                                    <span class="price-label">鱼翅金额：{{ item.minPrice }}鱼翅</span>
                                    <span class="time-label">显示时长：{{ formatTime(item.time) }}</span>
                                </div>
                                <div class="superchat-price-level-colors">
                                    <div class="color-info">
                                        <span>头部背景色：</span>
                                        <div class="color-preview" :style="{ backgroundColor: item.bgColor.header }"></div>
                                    </div>
                                    <div class="color-info">
                                        <span>主体背景色：</span>
                                        <div class="color-preview" :style="{ backgroundColor: item.bgColor.body }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Field>
            </Tab>
            <Tab title="指令弹幕">
                <CommandDanmakuConfig :options="options" @update:options="onUpdateOptions"/>
            </Tab>
        </Tabs>
    </Popup>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

import useClipboard from 'vue-clipboard3'

import Danmaku from "../components/Danmaku/Danmaku.vue"
import Gift from "../components/Gift/Gift.vue"
import Enter from "../components/Enter/Enter.vue"
import Superchat from "../components/Superchat/Superchat.vue"
import CommandDanmaku from "../components/CommandDanmaku/CommandDanmaku.vue"
import CommandDanmakuConfig from "../components/CommandDanmaku/CommandDanmakuConfig.vue"

import { Popup, Tab, Tabs, Field, Slider, Checkbox, CheckboxGroup, RadioGroup, Radio, Switch, Dialog } from 'vant'

import { useNormalStyle } from "../hooks/useNormalStyle.js"
import { useWebsocket } from "../hooks/useWebsocket.js"

import { giftData } from "@/global/utils/dydata/giftData.js"
import { saveLocalData, getLocalData, deepCopy, getClassStyle, getStrMiddle, formatObj } from "@/global/utils"
import { defaultOptions } from '../options'
import { exportFile, getNowDate } from '../../../global/utils'

const LOCAL_NAME = "monitor_options"

let domMonitor = ref(null);
let options = ref(deepCopy(defaultOptions));
let allGiftData = ref({});
let isShowOption = ref(false);
let activeTab = ref(0);
let { directionStyle, fontSizeStyle, avatarImgSizeStyle} = useNormalStyle(options);
let { connectWs, danmakuList, enterList, giftList, superchatList, commandDanmakuList, danmakuListSave, enterListSave, giftListSave, superchatListSave, commandDanmakuListSave } = useWebsocket(options, allGiftData);
let { toClipboard } = useClipboard();

let maxOrder = computed(() => {
    let ret = 0;
    for (const key in options.value.order) {
        if (options.value.order[key] > ret) {
            ret = options.value.order[key];
        }
    }
    return ret;
});

onMounted(async () => {
    let rid = window.rid;
    let propsOptions = window.options;
    if (propsOptions && propsOptions !== "") {
        // 当网页参数传了options，就使用网页的options
        options.value = JSON.parse(propsOptions);
    } else {
        let localData = JSON.parse(getLocalData(LOCAL_NAME));
        if (Object.prototype.toString.call(localData) !== '[object Object]') {
            localData = deepCopy(defaultOptions);
        }
        options.value = localData;
    }

    // 格式化Options，以保证向下兼容
    options.value = formatObj(options.value, defaultOptions);
    
    // 确保所有模块的order值固定，保证修改配置后区域位置不会变化
    options.value.order.enter = 0;
    options.value.order.gift = 1;
    options.value.order.danmaku = 2;
    options.value.order.superchat = 3;
    options.value.order.commandDanmaku = 4;
    
    // 确保超级弹幕配置使用默认配置中的选项（修复配置不一致问题）
    options.value.superchat.options = deepCopy(defaultOptions.superchat.options);
    
    // 确保超级弹幕配置项的完整性
    if (options.value.superchat && options.value.superchat.options) {
        options.value.superchat.options = options.value.superchat.options.map(ensureSuperchatOptionComplete);
    }
    
    // 初始化礼物数据
    await updateGiftData(rid);
    
    // 每8小时自动更新礼物数据
    const updateInterval = 8 * 60 * 60 * 1000; // 8小时
    const updateTimer = setInterval(() => {
        updateGiftData(rid);
    }, updateInterval);
    
    // 保存定时器，以便在组件卸载时清除
    window.giftDataUpdateTimer = updateTimer;
     
    connectWs(rid);
    
    // 组件卸载时清除定时器
    onBeforeUnmount(() => {
        if (window.giftDataUpdateTimer) {
            clearInterval(window.giftDataUpdateTimer);
            delete window.giftDataUpdateTimer;
        }
    });
})

/**
 * 更新礼物数据
 * @param {string} rid - 房间号
 */
async function updateGiftData(rid) {
    try {
        console.log('开始更新礼物数据...');
        
        // 获取房间礼物数据
        let roomGiftRes = await getRoomGiftData(rid);
        let roomGiftData = {prefix: "https://gfs-op.douyucdn.cn/dygift"};
        if ("giftList" in roomGiftRes.data) {
            for (let i = 0; i < roomGiftRes.data.giftList.length; i++) {
                let item = roomGiftRes.data.giftList[i];
                roomGiftData[item.id] = {
                    n: item.name,
                    pic: item.basicInfo.focusPic,
                    pc: item.priceInfo.price,
                }
            }
        }
        
        // 获取背包礼物配置
        let bagGiftRes = await getBagGiftData();
        
        // 合并礼物数据
        allGiftData.value = {...roomGiftData, ...giftData, ...bagGiftRes};
        
        console.log('礼物数据更新完成', allGiftData.value);
    } catch (error) {
        console.error('更新礼物数据失败:', error);
    }
}

/**
 * 获取背包礼物配置
 * @returns {Promise<Object>} 背包礼物配置
 */
async function getBagGiftData() {
    try {
        // 使用本地代理API解决CORS问题
        const res = await fetch('/api/giftconfig', {
            method: 'GET',
            credentials: 'include',
        });
        const text = await res.text();
        // 处理JSONP响应
        const jsonStr = text.substring('DYConfigCallback('.length, text.lastIndexOf(')'));
        const json = JSON.parse(jsonStr);
        const obj = {};
        for (const key in json.data) {
            let item = json.data[key];
            obj[key] = {
                n: item.name,
                pic: item.himg,
                pc: item.pc,
                svga: item.effect_icon,
            };
        }
        return obj;
    } catch (error) {
        console.error('获取背包礼物配置失败:', error);
        return {};
    }
}

function getRoomGiftData(rid) {
    return new Promise(resolve => {
        fetch('https://gift.douyucdn.cn/api/gift/v2/web/list?rid=' + rid,{
            method: 'GET',
        }).then(res => {
            return res.json();
        }).then(ret => {
            resolve(ret);
        }).catch(err => {
            console.log("请求失败!", err);
        })
    })
}

function onClickMonitor() {
    isShowOption.value = true;
}

function onChangeSwitch(list) {
    // 保持固定的order值，不随勾选顺序变化
    // 进场信息 → 礼物信息 → 超级弹幕 → 普通弹幕 → 指令弹幕
    options.value.order.enter = 0;
    options.value.order.gift = 1;
    options.value.order.danmaku = 2;
    options.value.order.superchat = 3;
    options.value.order.commandDanmaku = 4;
}

function onClickChangeMode() {
    if (options.value.mode === "night") {
        options.value.mode = "day";
    } else {
        options.value.mode = "night";
    }
}

function onClickRestOptions() {
    Dialog.confirm({
        title: '提示',
        message: '确认恢复默认设置？',
    })
    .then(() => {
        options.value = deepCopy(defaultOptions);
    }).catch(() => {});
}

function onClickSaveData() {
    Dialog.confirm({
        title: '保存数据',
        message: '下载弹幕、礼物、入场、超级弹幕数据',
    })
    .then(() => {
        let time = getNowDate();
        exportFile(`【弹幕数据】-${time}`, danmakuListSave.join("\n"));
        exportFile(`【礼物数据】-${time}`, giftListSave.join("\n"));
        exportFile(`【入场数据】-${time}`, enterListSave.join("\n"));
        exportFile(`【超级弹幕数据】-${time}`, superchatListSave.join("\n"));
    }).catch(() => {});
}

/**
 * 更新指令弹幕配置
 * @param {Object} newOptions - 新的配置对象
 */
function onUpdateOptions(newOptions) {
    options.value = newOptions;
}

function onClickShare() {
    let url = location.href;
    if (url.includes("?")) {
        url += "&exoptions=";
    } else {
        url += "?exoptions=";
    }
    url += encodeURIComponent(JSON.stringify(options.value));
    Dialog.confirm({
        title: '复制分享链接',
        message: '链接保存了当前设置，可粘贴至斗鱼直播伴侣浏览器源中，使设置与网页一致',
    })
    .then(async () => {
        try {
            await toClipboard(url);
        } catch (e) {
            console.error(e);
        }
    }).catch(() => {});
}

/**
 * 确保超级弹幕配置项的完整性
 * @param {Object} option - 超级弹幕配置项
 * @returns {Object} 完整的超级弹幕配置项
 */
function ensureSuperchatOptionComplete(option) {
    // 如果option不存在，返回默认配置
    if (!option) {
        return {
            minPrice: 0,
            time: 10,
            bgColor: {
                header: "rgb(208,0,0)",
                body: "rgb(230,33,23)"
            }
        };
    }
    
    // 确保bgColor存在
    if (!option.bgColor) {
        option.bgColor = {
            header: "rgb(208,0,0)",
            body: "rgb(230,33,23)"
        };
    }
    
    // 确保bgColor.header和bgColor.body存在
    if (!option.bgColor.header) {
        option.bgColor.header = "rgb(208,0,0)";
    }
    if (!option.bgColor.body) {
        option.bgColor.body = "rgb(230,33,23)";
    }
    
    // 确保minPrice和time存在
    if (option.minPrice === undefined) {
        option.minPrice = 0;
    }
    if (option.time === undefined) {
        option.time = 10;
    }
    
    return option;
}

/**
 * 格式化时间显示
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}秒`;
    } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}分钟`;
    } else {
        return `${Math.floor(seconds / 3600)}小时`;
    }
}


watch(options, (n, o) => {
    saveLocalData(LOCAL_NAME, JSON.stringify(n));
}, {deep: true})

watch(() => options.value.mode, (n, o) => {
    if (n === "night") {
        window.document.documentElement.setAttribute("data-theme", 'night');
    } else {
        window.document.documentElement.setAttribute("data-theme", 'day');
    }
}, {immediate: true, deep: true})


watch(() => options.value.transparent, (n, o) => {
    if (!domMonitor.value) {
        return;
    }
    if (!n) {
        domMonitor.value.style.backgroundColor = ``;
        return;
    }
    let str = getClassStyle(domMonitor.value, "backgroundColor");
    let rgb = String(str).match(/[^\(\)]+(?=\))/g)[0];
    if (n) {
        domMonitor.value.style.backgroundColor = `rgba(${rgb},0)`;
    }
}, {immediate: true, deep: true})


</script>

<style lang="scss" scoped>
@use "@/global/styles/themes/index.scss" as *;
.monitor {
    @include backgroundColor("backgroundColor");
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: v-bind(directionStyle);
    font-size: v-bind(fontSizeStyle);
    user-select: none;
}
.popup {
    .popup-top {
        user-select: none;
        height: 32px;
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        padding: 0 10px;
        box-sizing: border-box;
        text-align: right;
        border-bottom: 1px solid rgb(227, 227, 227);
        > div {
            width: 24px;
            height: 24px;
            margin-left: 10px;
            cursor: pointer;
        }
        .douyuex {
            position: absolute;
            left: 0;
        }
        .github {
            position: absolute;
            left: 34px;
        }
    }
}

/* 超级弹幕配置样式 */
.superchat-price-levels {
    padding: 10px 0;
}

.superchat-price-level-item {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid #1989fa;
}

.superchat-price-level-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: 600;
    font-size: 14px;
}

.price-label {
    color: #ff6b6b;
}

.time-label {
    color: #4ecdc4;
}

.superchat-price-level-colors {
    display: flex;
    gap: 20px;
    margin-top: 10px;
}

.color-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
}

.color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 调整小尺寸表单的样式 */
.van-field--small {
    margin-bottom: 8px;
}

</style>

<style lang="scss">
.avatar {
    width: v-bind(avatarImgSizeStyle);
    height: v-bind(avatarImgSizeStyle);
    border-radius: 50%;
}
</style>