<template>
    <div class="container">
        <p class="message">{{ msg }}</p>
        <div class="header-container">
            <div class="header">
                <input v-if="todo" class="check" type="checkbox" @click.once="$emit('checkBoxClicked')" />
                <h2>{{ titleTxt }}</h2>
                <p class="date">{{ startDate }} - {{ finishDate }}</p>
            </div>
            <div v-if="!todo">
                <img src="../assets/icons/icons8-undo-25.png" alt="Undo" @click="$emit('undoClick')"
                    class="image undo" />
            </div>
        </div>
        <p class="description">{{ descriptionTxt }}</p>
        <div class="expense-container">
            <p>{{ expenseAndCurrency }}</p>
        </div>
        <div>
            <a :href="url">{{ url }}</a>
        </div>
        <div class="img-container">
            <div class="user-container">
                <p class="user-name">created by</p>
                <p>{{ userName }}</p>
                <img :src="userPhoto" alt="user photo" style="width: 30px; height: 30px" />
            </div>
            <div v-if="todo" class="setting-container">
                <img src="../assets/icons/icons8-einstellungen.svg" alt="Change" @click="$emit('editClick')"
                    class="image" />
                <img src="../assets/icons/icons8-stornieren.svg" alt="Remove" @click="$emit('removeClick')"
                    class="image" />
            </div>
        </div>
        <div class="message-container">
            <p class="message">{{ message }}</p>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import { computedAsync } from '@vueuse/core';
import { db } from '../firebaseConfig.js';
import { getDoc, doc, collection } from 'firebase/firestore';
import altImg from '@/assets/icons/icons8-profilbild-100.png?url';

const emits = defineEmits(['checkBoxClicked', 'editClick', 'removeClick', 'undoClick']);
const props = defineProps([
    'msg',
    'todo',
    'titleTxt',
    'descriptionTxt',
    'url',
    'creator',
    'startDateTxt',
    'finishDateTxt',
    'message',
    'expectedExpense',
    'currency',
]);

const startDate = computed(() => {
    let date = props.startDateTxt.toDate().toDateString();
    let hour = ('0' + props.startDateTxt.toDate().getUTCHours()).slice(-2);
    let minute = ('0' + props.startDateTxt.toDate().getUTCMinutes()).slice(-2);
    let formattedStartDate = `${date} ${hour}:${minute}`;
    return formattedStartDate;
});

const finishDate = computed(() => {
    let date = props.finishDateTxt.toDate().toDateString();
    let hour = ('0' + props.finishDateTxt.toDate().getUTCHours()).slice(-2);
    let minute = ('0' + props.finishDateTxt.toDate().getUTCMinutes()).slice(-2);
    let formattedFinishDate = `${date} ${hour}:${minute}`;
    return formattedFinishDate;
});

const expenseAndCurrency = computed(() => {
    const formattedCurrency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: props.currency,
    });
    return formattedCurrency.format(props.expectedExpense);
});

const getUserDoc = computedAsync(async () => {
    return await getDoc(doc(collection(db, 'users'), props.creator));
});

const userName = computed(() => {
    if (!getUserDoc.value) {
        return '';
    }

    return getUserDoc.value.get('displayName');
});

const userPhoto = computed(() => {
    if (!getUserDoc.value) {
        return altImg;
    }

    return getUserDoc.value.get('photoURL') === 'DEFAULT' ? altImg : getUserDoc.value.get('photoURL');
});
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 1.5rem;
    background-color: white;
    border: 1px solid #1994eb;
    border-radius: 0.375rem;
    box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
}

p {
    margin: 0px;
}

img {
    margin: 0px;
}

.header-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.header {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 10px;
}

.check {
    width: 17px;
    height: 17px;
}

.date {
    font-size: 15px;
    color: #50585e;
}

.description {
    font-size: 17px;
}

a {
    width: auto;
    text-decoration: underline;
    color: blue;
    font-size: 17px;
}

a:link {
    color: blue;
}

a:hover {
    color: rgb(54, 54, 198);
}

a:visited {
    color: blue;
}

a:active {
    color: rgb(54, 54, 198);
}

a:focus {
    color: rgb(54, 54, 198);
}

.img-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.user-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
}

.user-container>p {
    margin: 0px;
}

.user-name {
    color: #373b3e;
}

.setting-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    column-gap: 10px;
}

.message-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.message {
    color: #dc2626;
    font-size: 14px;
}

.image {
    cursor: pointer;
}

.undo {
    margin-right: 10px;
}

.expense-container {
    font-size: 18px;
    font-weight: bold;
    color: #dd3d3d;
}
</style>
