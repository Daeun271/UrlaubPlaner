<template>
    <div class="bg">
        <h1>Hello {{ userName }}!</h1>
        <img :src="userProfile" class="profile">
        <div>
            <TripContainer @planClick="$router.push({name: 'group', params: { groupId: trip.id }})" v-for="trip in trips" v-bind:key="trip.id" :countryNameTxt="trip.country" :travelDuration="trip.arrivalDate + '-' + trip.departureDate"
            @invideClick="invide(trip.id)"/>
            <button @click="$router.push('/create-plan')" class="empty">
                <img src="../assets/logos/icons8-plus.svg" alt="Create">
                <p>Create a trip plan</p>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { db } from '../firebaseConfig.js'
import { collection, getDocs, query, where, doc, getDoc, documentId } from "firebase/firestore"; 
import { getCountryName } from '../countryCode.js'
import altImg from '@/assets/logos/icons8-profilbild-100.png?url'
import TripContainer from '../components/TripContainer.vue'

const store = useStore();
const userName = ref(store.state.user.displayName);
const userProfile = computed(() => {
    return store.state.user.photoURL ? store.state.user.photoURL : altImg;
});

const trips = ref([]);
onMounted(async () => {
    const tripIds = (await getDoc(doc(collection(db, "users"), store.state.user.uid))).get("trips");

    if (tripIds.length == 0) {
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.profile {
    width: 150px;
    height: 150px;
    margin-bottom: 50px;
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
}

.empty:hover {
    border-color: #616467;
}

.empty > img {
    padding-left: 475px;
    padding-right: 475px;
}

.empty > p {
    width: 1000px;
    margin-top: 17px;
    margin-bottom: 0px;
    font-size: 17px;
    font-weight: 600;
}
</style>