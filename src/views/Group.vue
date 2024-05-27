<template>
    <div class="bg">
        <h1>{{ planName }}</h1>
        <ul>
            <li v-for="member in members" :key="member.id">
                <img :src="member.photoURL" alt="Profile picture" />
                <p>{{ member.name }}</p>
            </li>
        </ul>
        <p class="text">You're planning to visit: {{ city }} {{ country }}</p>
        <p class="text text-2">Travel itinerary: {{ departureDate }} - {{ arrivalDate }}</p>
        <div class="btn-container">
            <Button
                @click="invite"
                btnText="Invite"
                :imgSrc="ShareIconUrl"
                :imgStyle="'margin:5px;'"
                class="btn-primary"
                style="padding: 5px 8px 5px 5px"
            />
            <Button @click="$router.push('/user')" btnText="See other trip plan" class="btn-secondary" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { db } from '../firebaseConfig.js';
import { doc, getDoc, collection, getDocs, query, where, documentId, updateDoc, arrayUnion } from 'firebase/firestore';
import { getCountryName } from '../countryCode.js';
import Button from '../components/Button.vue';
import ShareIconUrl from '@/assets/icons/icons8-teilen.svg?url';
import altImg from '@/assets/icons/icons8-profilbild-100.png?url';

const planName = ref('');
const country = ref('');
const city = ref('');
const arrivalDate = ref(null);
const departureDate = ref(null);
const members = ref([]);

const store = useStore();
const router = useRouter();
const route = useRoute();
const tripId = route.params.groupId;

onMounted(async () => {
    if (!store.state.user) {
        router.push({ name: 'sign-in-by-group', params: { groupId: tripId } });
        return;
    }

    const tripIds = (await getDoc(doc(collection(db, 'users'), store.state.user.uid))).get('trips');
    if (!tripIds.includes(tripId)) {
        const userRef = doc(db, 'users', store.state.user.uid);
        await updateDoc(userRef, {
            trips: arrayUnion(tripId),
        });
        const tripRef = doc(db, 'trips', tripId);
        await updateDoc(tripRef, {
            members: arrayUnion(store.state.user.uid),
        });
    }

    const docRef = doc(db, 'trips', tripId);
    const docSnap = await getDoc(docRef);
    planName.value = docSnap.data().planName;
    country.value = getCountryName(docSnap.data().country);
    city.value = docSnap.data().city;
    arrivalDate.value = docSnap.data().arrivalDate.toDate().toDateString();
    departureDate.value = docSnap.data().departureDate.toDate().toDateString();
    const membersField = docSnap.data().members;

    const q = query(collection(db, 'users'), where(documentId(), 'in', membersField));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const member = {
            id: doc.id,
            name: doc.data().displayName,
            photoURL: doc.data().photoURL === 'DEFAULT' ? altImg : doc.data().photoURL,
        };
        members.value.push(member);
    });
});

const invite = async () => {
    if (navigator.share) {
        navigator.share({
            title: 'Invite your friends or family to your group',
            text: 'Join my group on Urlaub Planner!',
            url: 'http://localhost:5173/trip/' + tripId + '/group',
        });
    }
};
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 100px;
}

h1 {
    margin: 30px;
}

ul {
    display: flex;
    align-items: center;
    text-align: center;
    gap: 2rem;
    list-style: none;
    padding: 0;
    margin: 20px;
}

.text {
    margin-top: 0;
    margin-bottom: 12px;
}

.text-2 {
    margin-bottom: 30px;
}

.btn-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.btn-primary {
    margin-right: 50px;
}
</style>
