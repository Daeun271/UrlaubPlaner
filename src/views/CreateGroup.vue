<template>
    <div class="bg">
        <h1 class="title">Create a trip plan</h1>
        <p class="p-1">Fill out the form below to create a new trip plan</p>
        <div class="container">
            <form @submit.prevent="addTrip">
                <Input labelId="planName" labelText="Plan name" :isImportant="true" inputType="text" v-model="planName"/>
                <CountryDropdown @selected-country="selectCountry"/>
                <Input labelId="city" labelText="City to travel" inputType="text" v-model="city"/>
                <Input labelId="arrivalDate" labelText="Arrival date" :isImportant="true" inputType="date" v-model="arrivalDate"/>
                <Input labelId="departureDate" labelText="Departure date" :isImportant="true" inputType="date" v-model="departureDate"/>
            </form>
            <p class="p-2" :class="{ error:isError }">Fields marked with * are required</p>
            <div class="btn-container">
                <Button @click="addTrip" @keyup.enter="addTrip" btnText="Create" class="create-btn btn-primary"/>
                <Button @click="$router.push('/user')" btnText="Cancel" class="cancel-btn btn-secondary" />
            </div>
            <div v-if="isBusy" class="form-spinner">
                <Spinner/>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ref } from 'vue'
import { db } from '../firebaseConfig.js'
import { collection, addDoc, Timestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import Input from '../components/Input.vue';
import CountryDropdown from '../components/CountryDropdown.vue';
import Button from '../components/Button.vue';
import Spinner from '../components/Spinner.vue';

const isError = ref(false);
const planName = ref('');
const country = ref('');
const city = ref('');
const arrivalDate = ref(null);
const departureDate = ref(null);
const isBusy = ref(false);
const router = useRouter();
const store = useStore();

const selectCountry = (result) => {
    country.value = result;
}

const addTrip = async () => {
    if (isBusy.value) {
        return;
    }

    if (planName.value && country.value && arrivalDate.value && departureDate.value) {
        isError.value = false;
        const docRef = await addDoc(collection(db, "trips"), {
            planName: planName.value,
            country: country.value,
            city: city.value,
            arrivalDate: Timestamp.fromDate(new Date(arrivalDate.value)),
            departureDate: Timestamp.fromDate(new Date(departureDate.value)),
            members: [store.state.user.uid],
            todoActivities: [],
            doneActivities: [],
        });
        const userDocRef = doc(db, "users", store.state.user.uid);
        await updateDoc(userDocRef, {
            trips: arrayUnion(docRef.id),
        });
        router.push({name: 'group', params: { groupId: docRef.id }});
    } else {
        isBusy.value = true;
        isError.value = true;
    }
    isBusy.value = false;
}
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
}
.container {
    width: 400px;
    background-color: white;
    border-radius: 0.375rem;
    padding: 1.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.title {
    margin-top: 0;
    margin-bottom: 8px;
}
.p-1 {
    margin-top: 0;
    margin-bottom: 40px;
}
.p-2 {
    color: #bdc2c5;
    font-size:10px;
    font-weight:100;
    margin-top: 0;
}

.error {
    color: #DC2626;
}
.btn-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.create-btn {
    margin-right: 50px;
}
.form-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>