<template>
    <div :class="`item ${showAnimation?'fadeInLeft' : ''} ${getItemClass(data)}`">
        <!-- 等级 -->
        <span v-if="showLevel" :class="`item__level UserLevel ${mode==='night' && Number(data.lv) < 70?'fansLevelNight':''} UserLevel--${data.lv}`"></span>
        <!-- 贵族 -->
        <span v-if="!!data.noble && showNoble" class="item__noble Barrage-icon Barrage-noble">
            <img :src="`${data.noble in nobleData ? nobleData.prefix + nobleData[data.noble].pic : ''}`" loading="lazy"/>
        </span>
        <!-- 粉丝牌 -->
        <div v-if="!!data.fansName && showFans" :class="`item__fans ${!!data.diamond && showDiamond ? 'is-diamonds' : ''} FansMedal fansLevel-${data.fansLv}`">
            <span class="FansMedal-name">{{data.fansName}}</span>
            <img v-if="!!data.diamond && showDiamond" class="FansMedalBox-diamondsIcon" src="https://sta-op.douyucdn.cn/douyu/2021/08/05/02304a1c04587e43ac626ce5ce07d935.png" alt="" loading="lazy">
        </div>
        <span v-if="data.roomAdmin=='4' && showRoomAdmin" class="item__roomAdmin">
            <span class="Barrage-icon Barrage-icon--roomAdmin"></span>
        </span>
        <span v-if="showAvatar" class="item__avatar"><img class="avatar" :src="getAvatarUrl(data.avatar)" @error="handleAvatarError" loading="lazy" /></span>
        <span :class="`item__name ${data.super==='5' ? 'super-name':'' }`">
            <span v-if="data.vip && showVip" class="Barrage-roomVipIcon"></span>
            {{data.nn}}：
        </span>
        <span :style="showColor?`color:${danmakuColor[data.color]};`:''" class="item__txt">{{data.txt}}</span>
    </div>
</template>

<script setup>
import {nobleData} from "@/global/utils/dydata/nobleData.js"
import {danmakuColor} from "@/global/utils/dydata/danmakuColor.js"
let props = defineProps(["data", "mode", "showAnimation", "showLevel", "showNoble", "showFans", "showDiamond", "showRoomAdmin", "showAvatar", "showVip", "showColor"])

/**
 * 获取头像URL
 * @param {string} avatar - 头像标识
 * @returns {string} 完整的头像URL
 */
const getAvatarUrl = (avatar) => {
    if (!avatar) {
        return '';
    }
    // 如果avatar已经包含完整路径或特殊格式，直接返回
    if (avatar.startsWith('http') || avatar.startsWith('https')) {
        return avatar;
    }
    // 检查avatar是否已经包含_small.jpg后缀
    if (avatar.endsWith('_small.jpg')) {
        return `https://apic.douyucdn.cn/upload/${avatar}`;
    }
    return `https://apic.douyucdn.cn/upload/${avatar}_small.jpg`;
};

/**
 * 处理头像加载错误
 * @param {Event} e - 错误事件
 */
const handleAvatarError = (e) => {
    // 可以设置默认头像或清空无效图片
    e.target.src = '';
    e.target.style.display = 'none';
};

// 控制日夜模式背景颜色
function getItemClass(data) {
    let ret = "";
    if (props.mode === "night") {
        if (data.nobleC || data.vip) {
            ret = "noble-night";
        }
        if (data.super == "5") {
            ret = "super-night";
        }
    } else {
        if (data.nobleC || data.vip) {
            ret = "noble-day";
        }
        if (data.super == "5") {
            ret = "super-day";
        }
    }
    return ret;
}
</script>

<style lang="scss" scoped>
@use "@/global/styles/themes/index.scss" as *;
.item {
    vertical-align: middle;
    width: 100%;
    margin-bottom: 5px;
    padding: 0 4px;
    box-sizing: border-box;
    &:first-child {
        margin-top: 5px;
    }
    >* {
        vertical-align: middle;
        margin-right: 5px;
    }
    >:nth-last-child(1), >:nth-last-child(2) {
        margin-right: 0;
    }
    .item__fans {
        width: 60px;
        position: relative;
    }
    .item__name {
        @include fontColor("nicknameColor");
    }
    .item__txt {
        @include fontColor("txtColor");
    }
}
.noble-day {
    background-color:#fff3df;
    border-top:1px solid #ffe4b8;
    border-bottom:1px solid #ffe4b8;
}

.noble-night {
    background-color:rgb(55,55,55);
    border-top:1px solid rgb(90,90,90);
    border-bottom:1px solid rgb(90,90,90);
}

.super-day {
    background-color:#fae9ff;
    border-top:1px solid #ffe4b8;
    border-bottom:1px solid #ffe4b8;
}

.super-night {
    background-color:rgb(55, 45, 45);
    border-top:1px solid rgb(90,90,90);
    border-bottom:1px solid rgb(90,90,90);
}

.super-name {
    color: #fe5656 !important;
}
</style>