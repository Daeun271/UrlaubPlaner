<template>
    <div class="bg">
        <SettingContainer titleTxt="Update profile">
            <div class="image-wrapper">
                <div class="image-container">
                    <img :src="userPhoto" class="profile-photo">
                    <input type="file" accept="image/*" ref="fileInput" style="display:none" @change="setPhoto">
                    <img src="../assets/icons/icons8-camera-100.png" class="overlay-icon" @click="$refs.fileInput.click()">
                </div>
                <p class="img-message" :class="{ 'img-error' : isImgError }">{{ messageImg }}</p>
            </div>
            <div style="margin-bottom:40px;">
                <SettingInput labelId="displayName" labelText="Display name" inputType="displayName" v-model="displayName" btnText="Rename" @buttonClick="setDisplayname" :isError="isNameError" :msgText="messageName"></SettingInput>
            </div>
        </SettingContainer>
        <SettingContainer v-if="!isFromGoogle" titleTxt="Danger Zone">
            <div>
                <SettingInput labelId="email" labelText="Email" inputType="email" v-model="email" btnText="Change" @buttonClick="isReauthenticated(setEmail)" :isError="isEmailError" :msgText="messageEmail"></SettingInput>
            </div>
            <div>
                <SettingInput labelId="newPassword" labelText="New password" inputType="password" v-model="newPassword" btnText="Change" @buttonClick="isReauthenticated(setPassword)"></SettingInput>
            </div>
            <div class="button-container">
                <Button @click="isReauthenticated(resetPassword)" btnText="Reset password" class="btn-primary"></Button>
                <Button @click="isReauthenticated(deleteUser)" btnText="Delete account" class="btn-tertiary"></Button>
            </div>
        </SettingContainer>

        <Modal v-if="isReauthenticationModalClicked" @closeModal="closeReauthenticationModal" width="30%">
            <div>
                <p>Before changing your security-secure data, please enter your current password.</p>
                <Input labelId="currentPassword" labelText="Current password" inputType="password" v-model="currentPassword"></Input>
            </div>
            <template v-slot:footer>
                <div>
                    <Button @click="reauthenticateUser" @keyup.enter="reauthenticateUser" btnText="Confirm" class="btn-primary" style="width:100%; height:40px;" />
                    <p class="modal-message" :class="{ 'modal-error' : isReauthenticationError }">{{ reauthenticationMessage }}</p>
                </div>
            </template>
        </Modal>

        <Modal v-if="isVerificationModalClicked" @closeModal="closeVerificationModal" width="40%">
            <div>
                <p>Verify your new email address, before updating it. You will receive a verification email and be logged out. When you verify your email, you can sign in with your new email. If not, you can sign in with your current email.</p>
            </div>
            <template v-slot:footer>
                <div>
                    <Button @click="verifyUser" @keyup.enter="verifyUser" btnText="Send verification email" class="btn-primary" style="width:100%; height:40px;" />
                    <p class="modal-message" :class="{ 'modal-error' : isVerficationError }">{{ verificationMessage }}</p>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { db } from '../firebaseConfig.js';
import { doc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider } from 'firebase/auth';
import SettingContainer from '@/components/SettingContainer.vue';
import altImg from '@/assets/icons/icons8-profilbild-100.png?url';
import SettingInput from '@/components/SettingInput.vue';
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import Modal from '@/components/Modal.vue';

const store = useStore();
const userId = store.state.user.uid;
const userPhoto = ref(store.state.user.photoURL);
if (!userPhoto.value) {
    userPhoto.value = altImg;
}
const displayName = ref(store.state.user.displayName);
const email = ref(store.state.user.email);
const newPassword = ref('');
const currentPassword = ref('');

const isImgError = ref(false);
const messageImg = ref('');
const isNameError = ref(false);
const messageName = ref('');
const isEmailError = ref(false);
const messageEmail = ref('');

const isFromGoogle = computed(() => {
    return store.state.user.providerData[0].providerId === 'google.com';
});

let isReauthenticatedVal = false;
const isReauthenticationModalClicked = ref(false);
const closeReauthenticationModal = () => {
    isReauthenticationModalClicked.value = false;
    isReauthenticationError.value = false;
    reauthenticationMessage.value = '';
}

const isReauthenticationError = ref(false);
const reauthenticationMessage = ref('');

const isVerificationModalClicked = ref(false);
const closeVerificationModal = () => {
    isVerificationModalClicked.value = false;
    isVerficationError.value = false;
    verificationMessage.value = '';
}
const isVerficationError = ref(false);
const verificationMessage = ref('');

/*
When the loaded image is too large, resize it before uploading.
And then update the user's profile photo in the database.
But the image's url is too long, so it is not stored in the database.
To handle this, the image must be uploaded to a storage service like Firebase Storage.
Rather than it, I generated some image urls and user can change their profile photo with them.

const setPhoto = async (event) => {
    isImgError.value = false;
    messageImg.value = '';
    const file = event.target.files[0];

    if (!file) {
        messageImg.value = 'No file selected.';
        isImgError.value = true;
        return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);

    try {
        await new Promise((resolve, reject) => {
            image.onload = () => {
                resolve(image);
            }
            image.onerror = () => {
                reject(new Error('An error occurred while loading the image.'));
            }
        });
    } catch (error) {
        if (error && error.message) {
            messageImg.value = error.message + ' Please try again.';
        }
        else {
            messageImg.value = 'An error occurred. Please try again.';
        }
        isImgError.value = true;
        return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 150;
    canvas.height = 150;
    ctx.drawImage(image, 0, 0, 150, 150);
    const imageUrl = canvas.toDataURL('image/jpeg', 0.7);

    try {
        await store.dispatch('updateUserProfile', { displayName: store.state.user.displayName, photoURL: imageUrl });
        await updateDoc(doc(db, "users", userId), {
            photoURL: imageUrl
        });
    } catch (error) {
        if (error && error.message) {
            messageImg.value = error.message + ' Please try again.';
        }
        else {
            messageImg.value = 'An error occurred. Please try again.';
        }
        isImgError.value = true;
    }

    userPhoto.value = imageUrl;
    isImgError.value = false;
    messageImg.value = 'Profile photo updated successfully.';
}
*/

const errrorMessages = {
    'auth/invalid-credential': 'The password is wrong. Please try again.',
    'auth/invalid-display-name': 'Display name should be not empty.',
    'auth/same-display-name': 'Same name as the current one.',
    'auth/invalid-new-email': 'Please enter a valid email.',

    'auth/missing-password': 'Please enter your password.',
    'auth/weak-password': 'Password must be a string with at least 6 characters.',
    'auth/invalid-password': 'Please enter a valid password.',
};

const errorCodeToMessage = (errorCode) => {
    return errrorMessages[errorCode] || 'An error occurred. Please try again.';
}

const setPhoto = () => {
    console.log('setPhoto');
}

const setDisplayname = async () => {
    try {
        await store.dispatch('updateUserProfile', { displayName: displayName.value, photoURL: store.state.user.photoURL });
        await updateDoc(doc(db, "users", userId), {
            displayName: displayName.value
        });
        isNameError.value = false;
        messageName.value = 'Display name updated successfully.';
    } catch (error) {
        if (error && error.code !== undefined) {
            messageName.value = errorCodeToMessage(error.code);
            isNameError.value = true;
        } else {
            throw error;
        }
    }
}

const isReauthenticated = (callback) => {
    isReauthenticatedVal ? callback() : isReauthenticationModalClicked.value = true;
}

const reauthenticateUser = async () => {
    try {
        const credential = EmailAuthProvider.credential(store.state.user.email, currentPassword.value);
        await store.dispatch('reauthenticateUser', credential);

        isReauthenticationError.value = false;
        reauthenticationMessage.value = 'Confirmed successfully.';
        isReauthenticatedVal = true;
        isReauthenticationModalClicked.value = false;
    } catch (error) {
        if (error && error.code !== undefined) {
            reauthenticationMessage.value = errorCodeToMessage(error.code);
            isReauthenticationError.value = true;
        } else {
            throw error;
        }
    }
}

const setEmail = async () => {
    if (email.value.trim() === '') {
        messageEmail.value = 'Please enter your new email.';
        isEmailError.value = true;
        return;
    }

    if (email.value === store.state.user.email) {
        messageEmail.value = 'Same email as the current one.';
        isEmailError.value = true;
        return;
    }

    messageEmail.value = '';
    isEmailError.value = false;
    verificationMessage.value = '';
    isVerficationError.value = false;
    isVerificationModalClicked.value = true;
}

const router = useRouter();
const verifyUser = async () => {
    try {
        await store.dispatch('verifyUserEmail', email.value);
        isVerficationError.value = false;
        verificationMessage.value = 'Verification email sent successfully. Please check your new email.';
        isVerificationModalClicked.value = false;

        await store.dispatch('logOut');
        router.push('/signin');
    } catch (error) {
        if (error && error.code !== undefined) {
            verificationMessage.value = errorCodeToMessage(error.code);
            isVerficationError.value = true;
        }
        else {
            verificationMessage.value = 'An error occurred. Please try again.';
            isVerficationError.value = true;
        }
    }
}

const setPassword = () => {
    console.log('setPassword');
}

const resetPassword = () => {
    console.log('resetPassword');
}

const deleteUser = () => {
    console.log('deleteUser');
}
</script>

<style scoped>
.bg {
    display: flex;
    flex-direction: column;
}

.image-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.image-container {
    border: none;
    padding: 0;
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

.img-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: blue;
}

.img-error {
    color: red;
}

.button-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-bottom: 40px;
}

.modal-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: blue;
}

.modal-error {
    color: red;
}
</style>