<template>
<div class="bg">
    <h1>To do</h1>
    <div class="activity-container">
        <ActivityContainer v-for="activity in todoActivities" v-bind:key="activity.title" :titleTxt="activity.title" :descriptionTxt="activity.description" :url="activity.url" :creator="activity.creator" :startDateTxt="activity.startTimestamp" :finishDateTxt="activity.finishTimestamp" :expectedExpense="activity.expectedExpense" :currency="currency"
        @editClick="editActivity(activity)" @removeClick="removeActivity(activity)" @checkBoxClicked.once="finishActivity(activity)" :todo="true"/>
    </div>
    <div class="btn-container">
        <button class="isPoppedUp-btn" @click="openModal"></button>
    </div>
    <h1>Done</h1>
    <div class="activity-container">
        <ActivityContainer v-for="activity in doneActivities" v-bind:key="activity.title" :titleTxt="activity.title" :descriptionTxt="activity.description" :url="activity.url" :creator="activity.creator" :startDateTxt="activity.startTimestamp" :finishDateTxt="activity.finishTimestamp" :expectedExpense="activity.expectedExpense" :currency="currency"
        :todo="false" @undoClick="undoActivity(activity)"/>
    </div>
    
    <Modal v-if="isPoppedUp" @closeModal="closeModal">
        <div class="input-container">
            <Input labelId="title" labelText="Title" inputType="text" v-model="title" :isImportant="true"/>
            <label for="description" style="font-weight: 700;">Description</label>
            <br/>
            <textarea id="description" v-model="description" cols="50" rows="10" class="form-description"></textarea>
            <Input labelId="url" labelText="URL" inputType="text" v-model="url" />
            <label for="startDate" style="font-weight: 700;">Start Date</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
            <br/>
            <input id="startDate" type="date" :min="departureDate" :max="arrivalDate" v-model="startDate" class="form-input"/>
            <Input labelId="startTime" labelText="Start time" inputType="time" v-model="startTime" :isImportant="true"/>
            <label for="finishDate" style="font-weight: 700;">Finish Date</label>
            <br/>
            <input id="finishDate" type="date" :min="departureDate" :max="arrivalDate" v-model="finishDate" class="form-input"/>
            <Input labelId="finishTime" labelText="Finish time" inputType="time" v-model="finishTime" />
            <label for="expectedExpense" style="font-weight: 700;">Expected expense</label>
            <br/>
            <input id="expectedExpense" type="number" v-model="expectedExpense" class="form-input"/>
        </div>
        <template v-slot:footer>
            <div>
                <Button @click="changeActivity" @keyup.enter="changeActivity" :btnText="isEditing ? 'Save changes' : 'Add activity'" class="btn-primary" style="width:100%; height:45px; margin-top:0.5rem;" />
                <p class="form-message">{{ errorMessage }}</p>
            </div>
        </template>
    </Modal>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { db } from '../firebaseConfig.js'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import ActivityContainer from '../components/ActivityContainer.vue';
import Modal from '../components/Modal.vue';

const title = ref('');
const description = ref('');
const url = ref('');
const arrivalDate = ref('');
const departureDate = ref('');
const startDate = ref('');
const finishDate = ref('');
const startTime = ref('');
const finishTime = ref('');
const expectedExpense = ref(0);
const todoActivities = ref([]);
const doneActivities = ref([]);
const isPoppedUp = ref(false);
let isEditing = false;
const errorMessage = ref('');

const route = useRoute();
const tripId = route.params.groupId;
const tripRef = doc(db, "trips", tripId);
const tripSnap = getDoc(tripRef);
const currency = ref('');
tripSnap.then((doc) => {
    currency.value = doc.data().currency;
});

const store = useStore();
const userId = store.state.user.uid;

const convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp.toDate().toDateString());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const convertTimestampToLocalTime = (timestamp) => {
    return ("0" + timestamp.toDate().getUTCHours()).slice(-2) + ':' + ("0" + timestamp.toDate().getUTCMinutes()).slice(-2);
}

const isValid = (url) => {
    let regex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regex.test(url);
}

onMounted(async () => {
    const timestampArrivalDate = (await tripSnap).data().arrivalDate;
    arrivalDate.value = convertTimestampToDate(timestampArrivalDate);
    const timestampDepartureDate = (await tripSnap).data().departureDate;
    departureDate.value = convertTimestampToDate(timestampDepartureDate);

    if((await tripSnap).data().todoActivities.length === 0 && (await tripSnap).data().doneActivities.length === 0){
        return;
    }

    if((await tripSnap).data().todoActivities.length > 0){
        todoActivities.value = (await tripSnap).data().todoActivities.sort((a, b) => {
            return (a.startTimestamp - b.startTimestamp);
        });
    }

    if((await tripSnap).data().doneActivities.length > 0){
        doneActivities.value = (await tripSnap).data().doneActivities.sort((a, b) => {
            return (a.startTimestamp - b.startTimestamp);
        });
    }
});

const initializeInput = () => {
    title.value = '';
    description.value = '';
    url.value = '';
    startDate.value = '';
    startTime.value = '';
    finishDate.value = '';
    finishTime.value = '';
    expectedExpense.value = 0;
}

const openModal = () => {
    isEditing = false;
    initializeInput();
    isPoppedUp.value = true;
}
const closeModal = () => {
    isPoppedUp.value = false;
    isEditing = false;
}

let oldActivity = null;
const editActivity = async (activity) => {
    isEditing = true;
    title.value = activity.title;
    description.value = activity.description;
    url.value = activity.url;
    startDate.value = convertTimestampToDate(activity.startTimestamp);
    startTime.value = convertTimestampToLocalTime(activity.startTimestamp);
    finishDate.value = convertTimestampToDate(activity.finishTimestamp);
    finishTime.value = convertTimestampToLocalTime(activity.finishTimestamp);
    expectedExpense.value = activity.expectedExpense;
    oldActivity = activity;
    isPoppedUp.value = true;
}

const changeActivity = () => {
    return isEditing ? rewriteActivity(oldActivity) : addActivity();
}

const validateAndGetActivity = () => {
    if(url.value && !isValid(url.value)){
        errorMessage.value = 'The URL is not valid.';
        return null;
    }

    if(finishDate.value && finishTime.value && (new Date(finishDate.value + ' ' + finishTime.value + ':00')) < (new Date(startDate.value + ' ' + startTime.value + ':00'))){
        errorMessage.value = 'The finish date should be later than the start date.';
        return null;
    }else if(!finishDate.value && finishTime.value && (new Date(startDate.value + ' ' + finishTime.value + ':00')) < (new Date(startDate.value + ' ' + startTime.value + ':00'))){
        errorMessage.value = 'The finish time should be later than the start time.';
        return null;
    }else if(finishDate.value && !finishTime.value && (new Date(finishDate.value)) < (new Date(startDate.value))){
        errorMessage.value = 'The finish date should be later than the start date.';
        return null;
    }

    if(!title.value || !startDate.value || !startTime.value){
        errorMessage.value = 'Fields marked with * are required.';
        return null;
    }

    errorMessage.value = '';

    let strStartTimestamp = startDate.value + 'T' + startTime.value + ':00Z';
    let strFinishTimestamp = '';
    if(finishDate.value && finishTime.value){
        strFinishTimestamp = finishDate.value + 'T' + finishTime.value + ':00Z';
    }else if(finishDate.value && !finishTime.value){
        strFinishTimestamp = finishDate.value + 'T' + '00:00:00Z';
    }else if(!finishDate.value && finishTime.value){
        strFinishTimestamp = startDate.value + 'T' + finishTime.value + ':00Z';
    }else{
        strFinishTimestamp = strStartTimestamp;
    }

    const formattedActivity = {
        'title': title.value,
        'description': description.value,
        'url': url.value,
        'startTimestamp': Timestamp.fromDate(new Date(strStartTimestamp)),
        'finishTimestamp': Timestamp.fromDate(new Date(strFinishTimestamp)),
        'expectedExpense': Number(expectedExpense.value),
        'creator': userId,
    };

    return formattedActivity;
}

const addActivity = async () => {
    let activity = validateAndGetActivity();

    if(!activity){
        return;
    }

    await updateDoc(tripRef, {
        todoActivities: arrayUnion(activity),
    });

    todoActivities.value = [...todoActivities.value, activity].sort((a, b) => {
        return (a.startTimestamp - b.startTimestamp);
    });

    initializeInput();
    isPoppedUp.value = false;
}

const rewriteActivity = async (oldActivity) => {
    let newActivity = validateAndGetActivity();

    if(!newActivity){
        return;
    }

    await removeActivity(oldActivity);
    addActivity();

    isEditing = false;
}

const removeActivity = async (activity) => {
    await updateDoc(tripRef, {
        todoActivities: arrayRemove(activity),
    });
    let index = todoActivities.value.indexOf(activity);
    todoActivities.value.splice(index, 1);
}

const finishActivity = async (activity) => {
    await updateDoc(tripRef, {
        todoActivities: arrayRemove(activity),
        doneActivities: arrayUnion(activity),
    });
    let index = todoActivities.value.indexOf(activity);
    todoActivities.value.splice(index, 1);
    doneActivities.value = [...doneActivities.value, activity].sort((a, b) => {
        return (a.startTimestamp - b.startTimestamp);
    });
}

const undoActivity = async (activity) => {
    await updateDoc(tripRef, {
        doneActivities: arrayRemove(activity),
        todoActivities: arrayUnion(activity),
    });
    let index = doneActivities.value.indexOf(activity);
    doneActivities.value.splice(index, 1);
    todoActivities.value = [...todoActivities.value, activity].sort((a, b) => {
        return (a.startTimestamp - b.startTimestamp);
    });
}
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 30px 70px 30px 70px;
    row-gap: 30px;
}

h1 {
    margin: 0;
}

.activity-container {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    width: 100%;
}

.btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100px;
}

.isPoppedUp-btn {
    display: flex;
    align-items: center;
    width: 100px;
    height: 100px;
    padding: 0px;
    background: url(../assets/icons/icons8-plus-blue.svg) no-repeat center;
    background-size: 100%;
    border: none;
    cursor: pointer;
}

.input-container {
    width: 100%;
    padding: 1.5rem;
}

.form-input {
    width: 100%;
    height: 30px;
    border: 1px solid rgb(209 213 219);;
    border-radius: 0.375rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    padding: 0.375rem 0.75rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
} 

.form-input:focus {
    outline: none;
    border-color: rgb(59 130 246);
}

.form-description {
    width: 100%;
    height: 150px;
    border: 1px solid rgb(209 213 219);;
    border-radius: 0.375rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    padding: 0.375rem 0.75rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    resize: vertical;
}

.form-description:focus {
    outline: none;
    border-color: rgb(59 130 246);
}

.form-message {
    color: #DC2626;
    font-size: 12px;
    margin-top: 0.25rem;
    margin-bottom: 0;
}
</style>