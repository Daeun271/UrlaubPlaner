<template>
    <div class="bg">
        <h1>Hello {{ userName }}!</h1>
        <div class="profile-container">
            <img :src="userPhoto" class="profile-photo">
            <img src="../assets/icons/icons8-modify-150.png" class="overlay-icon" @click="isClicked=true">
        </div>
        <div style="width:100%;">
            <TripContainer @planClick="$router.push({name: 'group', params: { groupId: trip.id }})" v-for="trip in trips" v-bind:key="trip.id" :countryNameTxt="trip.country" :travelDuration="trip.arrivalDate + '-' + trip.departureDate"
            @invideClick="invide(trip.id)"/>
            <button @click="$router.push('/create-group')" class="empty">
                <img src="../assets/icons/icons8-plus.svg" alt="Create">
                <p>Create a trip plan</p>
            </button>
        </div>

        <Modal v-if="isClicked" @closeModal="closeModal" width="25%">
            <div class="user-container">
                <h2>{{ userName }}</h2>
                <p>{{ userEmail }}</p>
            </div>
            <template v-slot:footer>
                <div>
                    <Button @click="$router.push('/setting')" @keyup.enter="$router.push('/setting')" btnText="Change my profile" class="btn-primary" style="width:100%; height:40px;" />
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { onMounted } from 'vue'
import { db } from '../firebaseConfig.js'
import { collection, getDocs, query, where, doc, getDoc, documentId } from "firebase/firestore"; 
import { getCountryName } from '../countryCode.js'
import TripContainer from '../components/TripContainer.vue'
import altImg from '@/assets/icons/icons8-profilbild-100.png?url'
import Modal from '../components/Modal.vue';
import Button from '../components/Button.vue';

const store = useStore();
const userName = ref(store.state.user.displayName);
const userPhoto = computed(() => store.state.user.photoURL ? store.state.user.photoURL : altImg);
const userEmail = ref(store.state.user.email);

const isClicked = ref(false);
const closeModal = () => {
    isClicked.value = false;
}

const trips = ref([]);
onMounted(async () => {
    const tripIds = (await getDoc(doc(collection(db, "users"), store.state.user.uid))).get("trips");

    if (tripIds.length === 0) {
        trips.value = [];
        return;
    }

    const q = query(collection(db, "trips"), where(documentId(), "in", tripIds));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const countryName = getCountryName(doc.data().country);
        const arrivalDate = doc.data().arrivalDate.toDate().toDateString();
        const departureDate = doc.data().departureDate.toDate().toDateString();
        const trip = {
            'id': doc.id,
            'country': countryName,
            'arrivalDate': arrivalDate,
            'departureDate': departureDate,
        };
        trips.value.push(trip);
    });
});

const invide = async (tripId) => {
    if (navigator.share) {
        navigator.share({
            title: 'Invite your friends or family to your group',
            text: 'Join my group on Urlaub Planner!',
            url: 'http://localhost:5173/trip/' + tripId + '/group',
        });
    }
}
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    padding: 30px 70px 30px 70px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.profile-container {
    border: none;
    padding: 0;
    margin-bottom: 30px;
    background-color: transparent;
    outline: none;
    position: relative;
    width: 150px;
    height: 150px;
}

.profile-photo {
    width: 100%;
    height: 100%;
    display: block;
}

.overlay-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    height: 70%;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
}

.profile-photo:hover, .profile-photo:focus, .profile-photo:active {
    opacity: 0.8;
}

.overlay-icon:hover, .overlay-icon:focus, .overlay-icon:active {
    opacity: 0.5;
}

.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px;
    color: black;
    background-color: white;
    border-style: dashed;
    border-color: #bdc3c7;
    border-radius: 0.375rem;
    width: 100%;
    cursor: pointer;
}

.empty:hover {
    border-color: #616467;
}

.empty > p {
    margin-top: 17px;
    margin-bottom: 0px;
    font-size: 17px;
    font-weight: 600;
}

.user-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.user-container > h2 {
    margin: 0;
}

.user-container > p {
    margin: 0;
}
</style>