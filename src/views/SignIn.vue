<template>
    <div class="bg">
        <Button @click="signInWithGoogle" :imgSrc="googleIconUrl" :imgStyle="'margin:5px;'" btnText="Sign In with Google" style="height:40px; width:298px; margin-bottom:0.75rem;" class="btn-secondary"/>
        <div class="container">
            <form @submit.prevent="signIn">
                <Input labelId="email" labelText="Email" inputType="email" v-model="email" />
                <Input labelId="password" labelText="Password" inputType="password" v-model="password" />
                <Button btnText="Sign In" style="width:250px; margin-top:0.75rem;" class="btn-primary"/>
                <div v-if="isBusy" class="form-spinner">
                    <Spinner/>
                </div>
                <p class="form-error">{{ errorMessage }}</p>
            </form>
        </div>
        <div class="div2-container">
            <p>Don't you have an account? <RouterLink :to="signUp">Sign Up</RouterLink></p>
            <p>Forgot your password? <RouterLink to="/reset">Reset Password</RouterLink></p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import Spinner from '../components/Spinner.vue';
import googleIconUrl from '@/assets/icons/icons8-google-logo.svg?url';
import { db } from '../firebaseConfig.js';
import { doc, getDoc, collection, updateDoc, arrayUnion, setDoc } from "firebase/firestore";

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const store = useStore();
const router = useRouter();
const isBusy = ref(false);
const route = useRoute();
const groupId = route.params.groupId;

const signIn = async () => {
    if(isBusy.value) {
        return;
    }
    isBusy.value = true;
    errorMessage.value = '';

    try {
        await store.dispatch('logIn', {
            email: email.value,
            password: password.value
        });
    }
    catch (err) {
        if (err && err.code !== undefined) {
            errorMessage.value = errorCodeToMessage(err.code);
        } else {
            errorMessage.value = 'An error occurred. Please try again.';
        }

        isBusy.value = false;
        return;
    }

    if (groupId) {
        const tripIds = (await getDoc(doc(collection(db, "users"), store.state.user.uid))).get("trips");

        if(!tripIds.includes(groupId)){
            const userRef = doc(db, "users", store.state.user.uid);
            await updateDoc(userRef, {
                trips: arrayUnion(groupId),
            });
            
            const tripRef = doc(db, "trips", groupId);
            await updateDoc(tripRef, {
                members: arrayUnion(store.state.user.uid),
            });
        };

        router.push({ name: 'group', params: { groupId: groupId } });
    } else {
        router.push('/user');
    }
    
    isBusy.value = false;
}

const errorMessages = {
    'auth/missing-email': 'Please enter your email.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/missing-password': 'Please enter your password.',
    'auth/invalid-password': 'Please enter a valid password.',
    'auth/invalid-credential': 'Invalid account. Try again.',
    'auth/too-many-requests': 'Too many requests. Try again later.',
}

const errorCodeToMessage = (errorCode) => {
    return errorMessages[errorCode] || 'Unknown error. Try again.';
}

const signInWithGoogle = async () => {
    if (isBusy.value) {
        return;
    }
    isBusy.value = true;

    try {
        await store.dispatch('googleSignIn');
    } catch (err) {
        if (err && err.code !== undefined) {
            errorMessage.value = errorCodeToMessage(err.code);
        } else {
            errorMessage.value = 'An error occurred. Please try again.';
        }

        isBusy.value = false;
        return;
    }

    const userDoc = (await getDoc(doc(collection(db, "users"), store.state.user.uid)));

    if (!userDoc.exists()) {
        await setDoc(doc(collection(db, "users"), store.state.user.uid), {
            displayName: store.state.user.displayName,
            photoURL: store.state.user.photoURL,
            trips: [],
        });
    }

    if (groupId) {
        const tripIds = (await getDoc(doc(collection(db, "users"), store.state.user.uid))).get("trips");

        if(!tripIds.includes(groupId)){
            const userRef = doc(db, "users", store.state.user.uid);
            await updateDoc(userRef, {
                trips: arrayUnion(groupId),
            });

            const tripRef = doc(db, "trips", groupId);
            await updateDoc(tripRef, {
                members: arrayUnion(store.state.user.uid),
            });
            
            router.push({ name: 'group', params: { groupId: groupId } });
        } else {
            router.push({ name: 'group', params: { groupId: groupId } });
        }
    } else {
        router.push('/user');
    }

    isBusy.value = false;
}

const signUp = computed(() => {
    if(groupId){
        return { name: 'sign-up-by-group', params: { groupId: groupId } };
    }else{
        return { name: 'sign-up' };
    }
});
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgb(243 244 246);
}

.container {
    background-color: white;
    border-radius: 0.375rem;
    padding: 1.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.form-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
}

.form-error {
    color: #DC2626;
    font-size: 12px;
    margin-top: 0.25rem;
    margin-bottom: 0;
}

.div2-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 0.75rem;
    font-size: 0.75rem;
    line-height: 1rem;
}

.div2-container > p {
    margin: 0;
}

.div2-container > p > a {
    color: rgb(59 130 246);
}

.div2-container > p > a:hover {
    color: rgb(30 64 175);
}
</style>