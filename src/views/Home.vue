<template>
    <div>
        <h1>Make a trip plan with your family/friends</h1>
        <p>Animation</p>
        <Button @click="$router.push('/signup')" btnText="get Started" class="btn-primary"/>
    </div>
</template>

<script setup>
import Button from '../components/Button.vue';
</script>

<style scoped>
</style>