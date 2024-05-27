<template>
    <div class="bg">
        <SettingContainer titleTxt="Update profile">
            <div class="image-wrapper">
                <div class="image-container">
                    <img :src="userPhoto" class="profile-photo" />
                    <!--<input type="file" accept="image/*" ref="fileInput" style="display:none" @change="setPhoto">-->
                    <img
                        src="../assets/icons/icons8-camera-100.png"
                        class="overlay-icon"
                        @click="isPhotoModalClicked = true"
                    />
                </div>
                <p class="message" :class="{ 'error-message': isImgError }">{{ messageImg }}</p>
            </div>
            <div style="margin-bottom: 40px">
                <SettingInput
                    labelId="displayName"
                    labelText="Display name"
                    inputType="displayName"
                    v-model="displayName"
                    btnText="Rename"
                    @buttonClick="setDisplayname"
                    :isError="isNameError"
                    :msgText="messageName"
                ></SettingInput>
            </div>
        </SettingContainer>
        <SettingContainer v-if="!isFromGoogle" titleTxt="Danger Zone">
            <div>
                <SettingInput
                    labelId="email"
                    labelText="Email"
                    inputType="email"
                    v-model="email"
                    btnText="Change"
                    @buttonClick="isReauthenticated(setEmail)"
                    :isError="isEmailError"
                    :msgText="messageEmail"
                ></SettingInput>
            </div>
            <div>
                <SettingInput
                    labelId="newPassword"
                    labelText="New password"
                    inputType="password"
                    v-model="newPassword"
                    btnText="Update"
                    @buttonClick="isReauthenticated(setPassword)"
                    :isError="isPasswordError"
                    :msgText="messagePassword"
                ></SettingInput>
            </div>
            <div class="button-container" style="margin-bottom: 20px">
                <Button @click="isReauthenticated(resetPassword)" btnText="Reset password" class="btn-primary"></Button>
                <Button @click="isReauthenticated(deleteUser)" btnText="Delete account" class="btn-tertiary"></Button>
            </div>
        </SettingContainer>

        <Modal v-if="isPhotoModalClicked" @closeModal="isPhotoModalClicked = false" width="30%">
            <div>
                <h2 style="margin: 0 0 30px 0">Choose your profile picture</h2>
                <div class="image-selection">
                    <img
                        v-for="image in [
                            image1,
                            image2,
                            image3,
                            image4,
                            image5,
                            image6,
                            image7,
                            image8,
                            image9,
                            image10,
                            image11,
                            image12,
                        ]"
                        :key="image"
                        :src="image"
                        style="cursor: pointer"
                        @click="setPhoto(imageToLink[image])"
                    />
                </div>
            </div>
        </Modal>

        <Modal v-if="isReauthenticationModalClicked" @closeModal="closeReauthenticationModal" width="30%">
            <div>
                <p>Before changing your security-secure data, please enter your current password.</p>
                <Input
                    labelId="currentPassword"
                    labelText="Current password"
                    inputType="password"
                    v-model="currentPassword"
                ></Input>
            </div>
            <template v-slot:footer>
                <div>
                    <Button
                        @click="reauthenticateUser"
                        @keyup.enter="reauthenticateUser"
                        btnText="Confirm"
                        class="btn-primary"
                        style="width: 100%; height: 40px"
                    />
                    <p class="message" :class="{ 'error-message': isReauthenticationError }">
                        {{ reauthenticationMessage }}
                    </p>
                </div>
            </template>
        </Modal>

        <Modal v-if="isVerificationModalClicked" @closeModal="closeVerificationModal" width="40%">
            <div>
                <p>
                    Verify your new email address, before updating it. You will receive a verification email and be
                    logged out. When you verify your email, you can sign in with your new email. If not, you can sign in
                    with your current email.
                </p>
            </div>
            <template v-slot:footer>
                <div>
                    <Button
                        @click="verifyUserEmail"
                        @keyup.enter="verifyUserEmail"
                        btnText="Send verification email"
                        class="btn-primary"
                        style="width: 100%; height: 40px"
                    />
                    <p class="message" :class="{ 'error-message': isVerficationError }">{{ verificationMessage }}</p>
                </div>
            </template>
        </Modal>

        <Modal v-if="isResetModalClicked" @closeModal="closeResetModal" width="40%">
            <div>
                <p>
                    Reset your password, before updating it. You will receive a password reset email and be logged out.
                    When you reset your password, you can sign in with your new password. If not, you can sign in with
                    your current password.
                </p>
            </div>
            <template v-slot:footer>
                <div>
                    <Button
                        @click="sendResetMail"
                        @keyup.enter="sendResetMail"
                        btnText="Send password reset mail"
                        class="btn-primary"
                        style="width: 100%; height: 40px"
                    />
                    <p class="message" :class="{ 'error-message': isResetError }">{{ resetMessage }}</p>
                </div>
            </template>
        </Modal>

        <Modal v-if="isDeleteModalClicked" @closeModal="closeDeleteModal" width="30%">
            <div>
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            </div>
            <template v-slot:footer>
                <div class="button-container">
                    <Button
                        @click="closeDeleteModal"
                        @keyup.enter="closeDeleteModal"
                        btnText="Cancel"
                        class="btn-primary"
                        style="width: 100%; height: 40px"
                    />
                    <Button
                        @click="deleteAccount"
                        @keyup.enter="deleteAccount"
                        btnText="Delete account"
                        class="btn-tertiary"
                        style="width: 100%; height: 40px"
                    />
                </div>
                <p class="message" :class="{ 'error-message': isDeleteError }">{{ deleteMessage }}</p>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { db } from '../firebaseConfig.js';
import { doc, updateDoc, collection, getDoc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider } from 'firebase/auth';
import SettingContainer from '@/components/SettingContainer.vue';
import altImg from '@/assets/icons/icons8-profilbild-100.png?url';
import SettingInput from '@/components/SettingInput.vue';
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import Modal from '@/components/Modal.vue';

import image1 from '@/assets/icons/icons8-circled-user-female-skin-type-1-and-2-100.png?url';
import image2 from '@/assets/icons/icons8-circled-user-female-skin-type-3-100.png?url';
import image3 from '@/assets/icons/icons8-circled-user-female-skin-type-4-100.png?url';
import image4 from '@/assets/icons/icons8-circled-user-female-skin-type-5-100.png?url';
import image5 from '@/assets/icons/icons8-circled-user-female-skin-type-6-100.png?url';
import image6 from '@/assets/icons/icons8-circled-user-female-skin-type-7-100.png?url';
import image7 from '@/assets/icons/icons8-circled-user-male-skin-type-1-and-2-100.png?url';
import image8 from '@/assets/icons/icons8-circled-user-male-skin-type-3-100.png?url';
import image9 from '@/assets/icons/icons8-circled-user-male-skin-type-4-100.png?url';
import image10 from '@/assets/icons/icons8-circled-user-male-skin-type-5-100.png?url';
import image11 from '@/assets/icons/icons8-circled-user-male-skin-type-6-100.png?url';
import image12 from '@/assets/icons/icons8-circled-user-male-skin-type-7-100.png?url';

const image1Link = 'https://img.icons8.com/color/150/circled-user-female-skin-type-1-2--v1.png';
const image2Link = 'https://img.icons8.com/color/150/circled-user-female-skin-type-3--v1.png';
const image3Link = 'https://img.icons8.com/color/150/circled-user-female-skin-type-4--v1.png';
const image4Link = 'https://img.icons8.com/color/150/circled-user-female-skin-type-5--v1.png';
const image5Link = 'https://img.icons8.com/color/150/circled-user-female-skin-type-6--v1.png';
const image6Link = 'https://img.icons8.com/color/150/circled-user-female-skin-type-7--v1.png';
const image7Link = 'https://img.icons8.com/color/150/circled-user-male-skin-type-1-2--v1.png';
const image8Link = 'https://img.icons8.com/color/150/circled-user-male-skin-type-3--v1.png';
const image9Link = 'https://img.icons8.com/color/150/circled-user-male-skin-type-4--v1.png';
const image10Link = 'https://img.icons8.com/color/150/circled-user-male-skin-type-5--v1.png';
const image11Link = 'https://img.icons8.com/color/150/circled-user-male-skin-type-6--v1.png';
const image12Link = 'https://img.icons8.com/color/150/circled-user-male-skin-type-7--v1.png';

const imageToLink = {
    [image1]: image1Link,
    [image2]: image2Link,
    [image3]: image3Link,
    [image4]: image4Link,
    [image5]: image5Link,
    [image6]: image6Link,
    [image7]: image7Link,
    [image8]: image8Link,
    [image9]: image9Link,
    [image10]: image10Link,
    [image11]: image11Link,
    [image12]: image12Link,
};

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
const isPasswordError = ref(false);
const messagePassword = ref('');

const isFromGoogle = computed(() => {
    return store.state.user.providerData[0].providerId === 'google.com';
});

let isReauthenticatedVal = false;
const isReauthenticationModalClicked = ref(false);
const closeReauthenticationModal = () => {
    isReauthenticationModalClicked.value = false;
    isReauthenticationError.value = false;
    reauthenticationMessage.value = '';
};
const isReauthenticationError = ref(false);
const reauthenticationMessage = ref('');

const isVerificationModalClicked = ref(false);
const closeVerificationModal = () => {
    isVerificationModalClicked.value = false;
    isVerficationError.value = false;
    verificationMessage.value = '';
};
const isVerficationError = ref(false);
const verificationMessage = ref('');

const isResetModalClicked = ref(false);
const closeResetModal = () => {
    isResetModalClicked.value = false;
    isResetError.value = false;
    resetMessage.value = '';
};
const isResetError = ref(false);
const resetMessage = ref('');

const isDeleteModalClicked = ref(false);
const closeDeleteModal = () => {
    isDeleteModalClicked.value = false;
    isDeleteError.value = false;
    deleteMessage.value = '';
};
const isDeleteError = ref(false);
const deleteMessage = ref('');

const isPhotoModalClicked = ref(false);

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
    'auth/invalid-new-email': 'Please enter a valid email address.',
    'auth/missing-password': 'Empty password. Please enter your password.',
    'auth/weak-password': 'Password must be a string with at least 6 characters.',
    'auth/invalid-password': 'Please enter a valid password.',
};

const errorCodeToMessage = (errorCode) => {
    return errrorMessages[errorCode] || 'An error occurred. Please try again.';
};

const setPhoto = async (link) => {
    isPhotoModalClicked.value = false;

    try {
        await store.dispatch('updateUserProfile', { displayName: store.state.user.displayName, photoURL: link });

        await updateDoc(doc(db, 'users', userId), {
            photoURL: link,
        });

        userPhoto.value = link;
        isImgError.value = false;
        messageImg.value = 'Profile photo updated successfully.';
    } catch (error) {
        messageImg.value = 'An error occurred. Please try again.';
        isImgError.value = true;
    }
};

const setDisplayname = async () => {
    if (displayName === store.state.user.displayName) {
        messageName.value = 'Same name as the current one.';
        isNameError.value = true;
        return;
    }

    try {
        await store.dispatch('updateUserProfile', {
            displayName: displayName.value,
            photoURL: store.state.user.photoURL,
        });
    } catch (error) {
        if (error && error.code !== undefined) {
            messageName.value = errorCodeToMessage(error.code);
        } else {
            messageName.value = 'An error occurred. Please try again.';
        }

        isNameError.value = true;
        return;
    }

    try {
        await updateDoc(doc(db, 'users', userId), {
            displayName: displayName.value,
        });

        isNameError.value = false;
        messageName.value = 'Display name updated successfully.';
    } catch (error) {
        messageName.value = 'An error occurred. Please try again.';
        isNameError.value = true;
    }
};

const isReauthenticated = (callback) => {
    isReauthenticatedVal ? callback() : (isReauthenticationModalClicked.value = true);
};

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
        } else {
            reauthenticationMessage.value = 'An error occurred. Please try again.';
        }

        isReauthenticationError.value = true;
    }
};

const setEmail = () => {
    if (email.value.trim() === '') {
        messageEmail.value = 'Empty email. Please enter your new email.';
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
};

const router = useRouter();
const verifyUserEmail = async () => {
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
        } else {
            verificationMessage.value = 'An error occurred. Please try again.';
        }

        isVerficationError.value = true;
    }
};

const setPassword = async () => {
    try {
        await store.dispatch('updateUserPassword', { password: newPassword.value });
        messagePassword.value = 'Password updated successfully.';
        isPasswordError.value = false;
    } catch (error) {
        if (error && error.code !== undefined) {
            messagePassword.value = errorCodeToMessage(error.code);
        } else {
            messagePassword.value = 'An error occurred. Please try again.';
        }

        isPasswordError.value = true;
    }
};

const resetPassword = () => {
    resetMessage.value = '';
    isResetError.value = false;
    isResetModalClicked.value = true;
};

const sendResetMail = async () => {
    try {
        await store.dispatch('resetPassword', { email: store.state.user.email });
        isResetError.value = false;
        resetMessage.value = 'Password reset email sent successfully. Please check your email.';

        await store.dispatch('logOut');
        router.push('/signin');
    } catch (error) {
        isResetError.value = true;
        resetMessage.value = 'An error occurred. Please try again.';
    }
};

const deleteUser = async () => {
    deleteMessage.value = '';
    isDeleteError.value = false;
    isDeleteModalClicked.value = true;
};

const deleteAccount = async () => {
    try {
        await store.dispatch('deleteUser');
        const tripIds = (await getDoc(doc(collection(db, 'users'), userId))).get('trips');

        if (tripIds.length === 0) {
            await deleteDoc(doc(db, 'users', userId));
        } else {
            await updateDoc(doc(db, 'users', userId), {
                displayName: 'Deleted user',
                photoURL: 'DEFAULT',
            });
        }

        deleteMessage.value = 'Account deleted successfully.';
        isDeleteError.value = false;
        router.push('/');
    } catch (error) {
        deleteMessage.value = 'An error occurred. Please try again.';
        isDeleteError.value = true;
    }
};
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

.profile-photo:hover,
.profile-photo:focus,
.profile-photo:active {
    opacity: 0.8;
}

.overlay-icon:hover,
.overlay-icon:focus,
.overlay-icon:active {
    opacity: 0.5;
}

.button-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;
}

.message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: blue;
}

.error-message {
    color: red;
}

.image-selection {
    display: grid;
    grid-template-columns: 160px 160px 160px;
    row-gap: 10px;
}
</style>
