<template>
    <div class="bg">
        <div class="recommendation-container" v-for="attraction in attractions" v-bind:key="attraction.title">
            <div class="description-container">
                <h1>{{ attraction.title }}</h1>
                <p>{{ attraction.category }}</p>
                <a :href="attraction.url">Visit website</a>
            </div>
            <img :src="attraction.img" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';
import { fetchTopSights } from '@/topSights';

const route = useRoute();
const tripId = route.params.groupId;
const tripDoc = doc(db, 'trips', tripId);

const attractions = ref([]);

onMounted(async () => {
    const tripSnap = await getDoc(tripDoc);
    const country = tripSnap.data().country;
    const city = tripSnap.data().city;

    attractions.value = await fetchTopSights(country, city);
});
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 200px 200px;
    gap: 20px;
    padding: 30px 50px 30px 50px;
}

.recommendation-container {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem;
    background-color: white;
    border: 1px solid #1994eb;
    border-radius: 0.375rem;
    box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.description-container {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}

.description-container>* {
    margin: 0;
}

a {
    color: #595d60;
    text-decoration-line: underline;
    text-decoration-style: dotted;
    outline: none;
}

a:hover {
    color: #b1b6b9;
}

a:focus {
    color: #b1b6b9;
}

a:active {
    color: #b1b6b9;
}

img {
    width: 150px;
    height: 150px;
}
</style>
