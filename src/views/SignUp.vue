<template>
    <div class="bg">
        <Button @click="signUpWithGoogle" :imgSrc="googleIconUrl" :imgStyle="'margin:5px;'" btnText="Sign Up with Google" style="height:40px; width:298px; margin-bottom:0.75rem;" class="btn-secondary"/>
        <div class="container">
            <form @submit.prevent="signUp">
                <Input labelId="name" labelText="Display Name" :isImportant="true" inputType="text" v-model="name" />
                <Input labelId="email" labelText="Email" :isImportant="true" inputType="email" v-model="email" />
                <Input labelId="password" labelText="Password" :isImportant="true" inputType="password" v-model="password" />
                <Button btnText="Sign Up" style="width:250px; margin-top:0.75rem;" class="btn-primary"/>
                <div v-if="isBusy" class="form-spinner">
                    <Spinner/>
                </div>
                <p class="form-error">{{ errorMessage }}</p>
            </form>
        </div>
        <div class="div2-container">
            <p>Do you have an account already? <RouterLink :to="signIn">Sign In</RouterLink></p>
        </div>
    </div>
</template>
  
<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import Spinner from '../components/Spinner.vue';
import googleIconUrl from '@/assets/icons/icons8-google-logo.svg?url';
import { db } from '../firebaseConfig.js';
import { doc, getDoc, collection, updateDoc, arrayUnion, setDoc, documentId, query, where, getDocs } from "firebase/firestore";

const name = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isBusy = ref(false);

const store = useStore();
const router = useRouter();
const route = useRoute();
const groupId = route.params.groupId;

const signUp = async () => {
    if (isBusy.value) {
        return;
    }
    isBusy.value = true;
    errorMessage.value = '';

    try {
        await store.dispatch('register', {
            email: email.value,
            password: password.value,
            name: name.value
        });
    } catch (err) {
        if (err && err.code !== undefined) {
            errorMessage.value = errorCodeToMessage(err.code);
        } else {
            errorMessage.value = 'An error occurred. Please try again.';
        }

        isBusy.value = false;
        return;
    }

    try {
        await setDoc(doc(db, "users", response.user.uid), {
            displayName: name,
            photoURL: "DEFAULT",
            trips: [],
        }, { merge: true });
    } catch (err) {
        errorMessage.value = 'An error occurred. Please try again.';

        if ((await getDoc(doc(collection(db, "users"), store.state.user.uid))).exists()) {
            deleteDoc(doc(db, "users", store.state.user.uid));
        }

        await store.dispatch('deleteUser');

        isBusy.value = false;
        return;
    }

    if(groupId){
        const userRef = doc(db, "users", store.state.user.uid);
        await updateDoc(userRef, {
            trips: arrayUnion(groupId),
        });

        const tripRef = doc(db, "trips", groupId);
        await updateDoc(tripRef, {
            members: arrayUnion(store.state.user.uid),
        });

        router.push({ name: 'group', params: { groupId: groupId } });
    }else{
        router.push('/user');
    }

    isBusy.value = false;
}

const errrorMessages = {
    'auth/missing-display': 'Please enter your display name.',
    'auth/invalid-display-name': 'Display name should be not empty.',
    'auth/missing-email': 'Please enter your email.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/email-already-in-use': 'This email is already in use.',
    'auth/missing-password': 'Please enter your password.',
    'auth/weak-password': 'Password must be a string with at least 6 characters.',
    'auth/invalid-password': 'Please enter a valid password.',
    'auth/popup-closed-by-user': 'Sign up with Google was canceled. Try again.',
};

const errorCodeToMessage = (errorCode) => {
    return errrorMessages[errorCode] || 'An error occurred. Please try again.';
}

const signUpWithGoogle = async () => {
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

const signIn = computed(() => {
    if(groupId){
        return { name: 'sign-in-by-group', params: { groupId: groupId } };
    }else{
        return { name: 'sign-in' };
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
    padding: 100px;
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