<template>
    <div class="bg">
        <div class="budget-container">
            <p>Budget: {{ budget }}</p>
            <p>Expense so far: {{ expense }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router';
import { db } from '../firebaseConfig.js'
import { doc, getDoc } from "firebase/firestore";
import { fetchCurrency } from '../currency';

const route = useRoute();
const tripId = route.params.groupId;
const tripRef = doc(db, "trips", tripId);
const tripSnap = getDoc(tripRef);

const budget = ref(0);
const getBuget = (async () => {
    const todoActivities = (await tripSnap).data().todoActivities;
    budget.value = todoActivities.reduce((acc, activity) => acc + activity.expectedExpense, 0); 
})();
const expense = ref(0);

/*
fetchCurrency().then((data) => {
    console.log(data.rates);
});
*/
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 30px 70px 30px 70px;
    row-gap: 30px;
}

.budget-container {
    border: 2px solid #dedede;
    border-color: #8aabc1;
    background-color: #c9ddec;
    border-radius: 5px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    font-size: 18px;
    font-weight: bold;
}

.budget-container > p {
    margin: 0;
}
</style>