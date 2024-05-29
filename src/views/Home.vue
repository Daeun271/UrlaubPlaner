<template>
    <div class="bg">
        <FeatureIntroduction v-for="target in targets" :key="target.id" :title="target.title" :imgSrc="target.imgSrc"
            :altTxt="target.altTxt" :isFirst="target.isFirst" :isVisible="target.isVisible" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import FeatureIntroduction from '@/components/FeatureIntroduction.vue';
import img1 from '../../urlaub-planer-images/userPage.png?url';
import img2 from '../../urlaub-planer-images/userPage.png?url';
import img3 from '../../urlaub-planer-images/userPage.png?url';
import img4 from '../../urlaub-planer-images/userPage.png?url';
import img5 from '../../urlaub-planer-images/userPage.png?url';

const targets = ref([
    {
        id: 1,
        title: 'Make a trip plan with your family/friends',
        imgSrc: img1,
        altTxt: 'groupList',
        isFirst: true,
        isVisible: true,
    },
    {
        id: 2,
        title: 'Plan your trip together',
        imgSrc: img2,
        altTxt: 'plan',
    },
    {
        id: 3,
        title: 'Chat with your friends',
        imgSrc: img3,
        altTxt: 'chat',
    },
    {
        id: 4,
        title: 'Manage your trip expenses together',
        imgSrc: img4,
        altTxt: 'expense',
    },
    {
        id: 5,
        title: 'Get recommendations for your trip',
        imgSrc: img5,
        altTxt: 'recommendation',
    },
]);
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 50px;
}

.bg>* {
    width: 80%;
}
</style>