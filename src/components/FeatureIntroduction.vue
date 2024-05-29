<template>
    <div class="feature-container" :class="{ visible: isVisible }" ref="target">
        <h1>{{ title }}</h1>
        <img :src="imgSrc" :alt="altTxt" />
        <Button v-if="isFirst" @click="$router.push('/signup')" btnText="Get started" class="btn-primary"
            style="width:120px;" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { defineProps } from 'vue';
import Button from '../components/Button.vue';

const props = defineProps({
    title: String,
    imgSrc: String,
    altTxt: String,
    isFirst: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: false },
});

const target = ref(null);
const isVisible = ref(false);

useIntersectionObserver(target, ([{ isIntersecting }]) => {
    if (isIntersecting) {
        isVisible.value = true;
    } else {
        isVisible.value = false;
    }
});
</script>

<style scoped>
.feature-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 3s ease;
}

.feature-container>h1 {
    text-align: center;
}

img {
    width: 100%;
    border: 2px solid #1994eb;
    border-radius: 0.375rem;
    margin-bottom: 2rem;
}

.visible {
    opacity: 1;
    transition: opacity 3s ease;
}
</style>