<template>
    <header>
        <title>Single-Page Application(SPA) using Vue 3</title>
        <meta charset="utf-8" />
        <meta name="description" content="Making a trip plan with your friends/family at UrlaubPlaner" />
        <meta name="keywords" content="UrlaubPlaner, Trip, Plan, Friends, Family" />
        <nav>
            <RouterLink :to="routeURL">
                <img src="@/assets/icons/logo.svg" alt="Logo" class="logo" /> UrlaubsPlaner
            </RouterLink>
            <div class="spacer"></div>
            <button v-if="isNotVerified" @click="click">
                <img class="info-icon" src="@/assets/icons/icons8-information.svg" alt="Notification" />
            </button>
            <ul>
                <li v-for="link in headerLinks" :key="link.path">
                    <RouterLink :to="link.path">{{ link.name }}</RouterLink>
                </li>
            </ul>
            <Button v-if="user === null" @click="signIn" btnText="Sign In" class="btn-primary" />
            <Button v-if="user === null" @click="signUp" btnText="Sign Up" class="btn-secondary" />
            <Button v-else @click="$router.push('/signout')" btnText="Sign Out" class="btn-primary" />
        </nav>
        <Toast
            v-if="isClicked"
            messageTitle="Verify your account"
            messageContent="We've sent you an email with a link to verify your account. If you don't see this email in your inbox, look for it in your junk mail folder."
            @click="close"
        />
    </header>

    <main>
        <RouterView />
    </main>

    <footer></footer>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import Button from './components/Button.vue';
import Toast from './components/Toast.vue';

const store = useStore();
const user = computed(() => store.state.user);
const routeURL = computed(() => (user.value !== null ? '/user' : '/'));

const headerLinks = computed(() => store.state.headerLinks);

const isNotVerified = computed(() => {
    if (store.state.user === null) {
        return false;
    }
    return !store.state.user.emailVerified;
});

const isClicked = ref(false);
const click = () => {
    isClicked.value = !isClicked.value;
};

const close = () => {
    isClicked.value = false;
};

const router = useRouter();
const signIn = () => {
    const groupId = getUrlGroupId();

    if (groupId) {
        router.push({ name: 'sign-in-by-group', params: { groupId: groupId } });
    } else {
        router.push({ name: 'sign-in' });
    }
};

const signUp = () => {
    const groupId = getUrlGroupId();

    if (groupId) {
        router.push({ name: 'sign-up-by-group', params: { groupId: groupId } });
    } else {
        router.push({ name: 'sign-up' });
    }
};

function getUrlGroupId() {
    const split = window.location.pathname.split('/');

    if (split.length === 3 && (split[1] === 'signin' || split[1] === 'signup')) {
        return split[2];
    }

    return null;
}
</script>

<style scoped>
header {
    flex: 0 0 auto;
}

main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}

footer {
    flex: 0 0 auto;
}

header > nav {
    display: flex;
    align-items: center;
    gap: 15px;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background-color: #fff;
    box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1);
    font-weight: 700;
}

header > nav * {
    outline: none;
}

.spacer {
    flex: 1 1 auto;
}

.logo {
    cursor: pointer;
    width: 25px;
    height: 25px;
    vertical-align: -7px;
}

header > nav > button {
    border: none;
    background-color: transparent;
    padding: 0;
}

header > nav > ul {
    display: flex;
    align-items: center;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
}

.router-link-exact-active:not(.btn) {
    color: #1994eb;
}

.info-icon {
    cursor: pointer;
    animation: shake 0.5s infinite;
}

@keyframes shake {
    0% {
        transform: scale(1, 1);
        -ms-transform: scale(1, 1);
        -webkit-transform: scale(1, 1);
    }

    25% {
        transform: scale(1.1, 1.1);
        -ms-transform: scale(1.1, 1.1);
        -webkit-transform: scale(1.1, 1.1);
    }

    50% {
        transform: scale(1.2, 1.2);
        -ms-transform: scale(1.2, 1.2);
        -webkit-transform: scale(1.2, 1.2);
    }

    75% {
        transform: scale(1.1, 1.1);
        -ms-transform: scale(1.1, 1.1);
        -webkit-transform: scale(1.1, 1.1);
    }

    100% {
        transform: scale(1, 1);
        -ms-transform: scale(1, 1);
        -webkit-transform: scale(1, 1);
    }
}

@media (min-width: 1024px) {
}
</style>
