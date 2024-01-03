<template>
    <div class="bg">
        <div class="header">
            <h2>Plan</h2>
            <form class="input-container" @submit.prevent="signIn">
                <input type="text" placeholder="Activity" v-model="activity">
                <br />
                <input type="text" placeholder="Description" v-model="description">
                <br />
                <input type="url" placeholder="URL" v-model="url">
                <br />
                <input type="date" min="2023-10-01" max="2023-10-10" placeholder="Date" v-model="date">
                <br />
                <input type="time" placeholder="Time" v-model="time">
                <br />
                <span @click="add" @keyup.enter="add" class="addBtn">Add</span>
            </form>
        </div>
        <ul>
            <li v-for="plan in plans" v-bind:key="plan.activity">
                <p>{{ plan.activity }}</p>
                <p>{{ plan.description }}</p>
                <a :href="plan.url" class="link">{{ plan.url }}</a>
                <p>{{ plan.date }}</p>
                <p>{{ plan.time }}</p>
                <img class="change" src="../assets/logos/icons8-einstellungen.svg" alt="Change" @click="change(plan)">
                <img class="close" src="../assets/logos/icons8-stornieren.svg" alt="Remove" @click="remove(plan)">
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const activity = ref('');
const description = ref('');
const url = ref(null);
const date = ref(null);
const time = ref(null);
const plans = ref([]);

const add = () => {
    const plan = {
        'activity': activity.value,
        'description': description.value,
        'url': url.value,
        'date': date.value,
        'time': time.value,
    };
    //duplicate check
    /*
    databank
    */
    // sort by date and time
    plans.value.push(plan);
}

const change = (plan) => {
    // change plan
}

const remove = (plan) => {
    const index = plans.value.indexOf(plan);
    plans.value.splice(index, 1);
}
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
}

.header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: #1994eb;
    padding: 30px 40px;
    color: white;
    text-align: center;
}

h2 {
    width: 100%;
}

.input-container {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
}

input {
    width: 100%;
    margin: 0;
    border: solid 1px #ccc;
    border-radius: 0;
    padding: 10px;
    float: left;
    font-size: 16px;
}

.addBtn {
    width: 100%;
    padding: 10px;
    background: #d9d9d9;
    color: #555;
    float: left;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
    transition: 0.3s;
    border-radius: 0;
}

.addBtn:hover {
    background-color: #bbb;
}

ul {
    margin: 0;
    padding: 0;
}

ul li {
    position: relative;
    padding: 12px 8px 12px 40px;
    background: #eee;
    font-size: 18px;
    width: 100%;
    transition: 0.2s;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

ul li:nth-child(odd) {
    background: #f9f9f9;
}

ul li:hover {
    background: #ddd;
}

.link {
    color: #1994eb;
}

.link:hover {
    color: #074cb2;
    text-shadow: #074cb2;
}

.link:active {
    color: #1994eb;
}

.link:visited {
    color: #1994eb;
}

.change {
    position: absolute;
    right: 40px;
    top: 0;
    padding-top: 12px;
    cursor: pointer;
}

.close {
    position: absolute;
    right: 20px;
    top: 0;
    padding-top: 12px;
    cursor: pointer;
}
</style>