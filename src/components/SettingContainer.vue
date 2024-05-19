<template>
    <div class="setting-box">
        <h2>{{ titleTxt }}</h2>
        <slot></slot>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    titleTxt: String,
})
</script>

<style scoped>
.setting-box {
    width: 100%;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    row-gap: 30px;
    padding-left: 20px;
}

.setting-box > h2 {
    margin: 20px 0 0 0;
}
</style>