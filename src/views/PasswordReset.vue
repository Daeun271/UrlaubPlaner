<template>
    <div class="bg">
        <div v-if="isSent===false">
            <p>Forgot your account's password? Enter your email address and we'll send you a recovery link.</p>
            <form @submit.prevent="sendRecoveryEmail">
                <Input labelId="email" labelText="Email" inputType="email" v-model="email" style="width:435px;"/>
                <Button @click="sendRecoveryEmail" @keyup.enter="sendRecoveryEmail" btnText="Send recovery email" />
            </form>
            <p class="form-error">{{ errorMessage }}</p>
        </div>
        <div v-else>
            <img src="../assets/logos/icons8-e-mail-36.png" alt="Email Img" />
            <h1>Account recovery email sent to {{ email }}</h1>
            <p>We've sent you an email with a link to reset your password. If you don't see this email in your inbox, look for it in your junk mail folder.</p>
        </div>
    </div>
</template>

<script setup>
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import { useStore } from 'vuex';
import { ref } from 'vue';

const store = useStore();
const email = ref('');
const isSent = ref(false);
const errorMessage = ref('');

const sendRecoveryEmail = async () => {
    try{
        errorMessage.value = '';
        await store.dispatch('resetPassword', {
            email: email.value
        });
        isSent.value = true;
    }
    catch (err) {
        if (err && err.code !== undefined) {
            errorMessage.value = errorCodeToMessage(err.code);
        } else {
            throw err;
        }
    }
}

const errorMessages = {
    'auth/missing-email': 'Please enter your email.',
    'auth/invalid-email': 'Please enter a valid email.',
}

const errorCodeToMessage = (errorCode) => {
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}
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

.bg > div{
    width: 500px;
    padding: 1rem;
    border-radius: 0.375rem;
    background-color: white;
    border: 1px solid #1994eb;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

p:not(.form-error) {
    font-size: 0.875rem;
    color: #4a5568;
    margin-top: 0;
    margin-bottom: 0.75rem;
}

.form-error {
    color: #DC2626;
    font-size: 12px;
    margin-top: 0.25rem;
    margin-bottom: 0;
}

h1 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}
</style>