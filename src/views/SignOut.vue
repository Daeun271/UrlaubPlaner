<template>
    <div>
        <p>Sign out</p>
    </div>
</template>
  
<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const store = useStore();
const router = useRouter();

onMounted(async () => {
    await store.dispatch('logOut');
    router.push('/');
});
</script>