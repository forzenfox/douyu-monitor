<template>
    <div ref="dom_superchat" class="superchat">
        <Default
            v-for="item in superchatList"
            v-memo="[options.mode, options.animation]"
            :key="item.key"
            :data="item"
            :mode="options.mode"
            :showAnimation="options.animation"
        ></Default>
    </div>
</template>

<script setup>
import { ref, onUpdated, onMounted } from 'vue'
import Default from "./templates/Default.vue"

import { useFlexStyle } from "../../hooks/useFlexStyle.js"
import { useBorderStyle } from "../../hooks/useBorderStyle.js"

let props = defineProps({
    maxOrder: {
        type: Number,
    },
    options: {
        type: Object,
    },
    superchatList: {
        type: Array,
    }
});

let dom_superchat = ref(null);
let { flexStyle, orderStyle, justifyContentStyle, textAlignStyle } = useFlexStyle(props, "superchat");
let { borderBottomStyle, borderRightStyle } = useBorderStyle(props, "superchat");

onUpdated(() => {
    // 可以添加滚动到底部等逻辑
})

onMounted(() => {
    // 可以添加事件监听等逻辑
})

</script>

<style lang="scss" scoped>
@use "@/global/styles/themes/index.scss" as *;
.superchat {
    height: 100%;
    order: v-bind(orderStyle);
    flex: v-bind(flexStyle);
    border-bottom: v-bind(borderBottomStyle);
    border-right: v-bind(borderRightStyle);
    overflow-x: hidden;
    overflow-y: auto;
    content-visibility: auto;
    position: relative;
    .item {
        justify-content: v-bind(justifyContentStyle);
        text-align: v-bind(textAlignStyle);
    }
}
</style>