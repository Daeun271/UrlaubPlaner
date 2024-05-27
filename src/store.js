import { createStore } from 'vuex';
import { auth, googleProvider } from './firebaseConfig.js';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    updateEmail,
    updatePassword,
    deleteUser,
    reauthenticateWithCredential,
    verifyBeforeUpdateEmail,
} from 'firebase/auth';

let userPromiseResolve = null;
const userPromise = new Promise((resolve, _reject) => {
    userPromiseResolve = resolve;
});

const store = createStore({
    state: {
        user: null,
        userPromise,
        headerLinks: [],
    },
    getters: {
        user(state) {
            return state.user;
        },
        isLoggedIn(state) {
            return state.user !== null;
        },
        userPromise(state) {
            return state.userPromise;
        },
        headerLinks(state) {
            return state.headerLinks;
        },
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user;
            userPromiseResolve(user);
        },
        SET_HEADER_LINKS(state, links) {
            state.headerLinks = links;
        },
    },
    actions: {
        async register(context, { email, password, name }) {
            if (name.trim() === '') {
                throw { code: 'auth/invalid-display-name' };
            }

            const response = await createUserWithEmailAndPassword(auth, email, password);

            if (response) {
                context.commit('SET_USER', response.user);
            }

            await updateProfile(response.user, { displayName: name });

            await sendEmailVerification(response.user);
        },

        async logIn(context, { email, password }) {
            const response = await signInWithEmailAndPassword(auth, email, password);

            if (response) {
                context.commit('SET_USER', response.user);
            }
        },

        async logOut(context) {
            await signOut(auth);
            context.commit('SET_USER', null);
        },

        async resetPassword(context, { email }) {
            if (email.trim() === '') {
                throw { code: 'auth/missing-email' };
            }

            await sendPasswordResetEmail(auth, email);
        },

        async setUser(context, user) {
            context.commit('SET_USER', user);
        },

        async googleSignIn(context) {
            const response = await signInWithPopup(auth, googleProvider);

            if (response) {
                context.commit('SET_USER', response.user);
                return response;
            }
        },

        setHeaderLinks(context, links) {
            context.commit('SET_HEADER_LINKS', links);
        },

        async updateUserProfile(context, { displayName, photoURL }) {
            if (displayName.trim() === '') {
                throw { code: 'auth/invalid-display-name' };
            }

            await updateProfile(auth.currentUser, { displayName, photoURL });
        },

        async verifyUserEmail(context, email) {
            await verifyBeforeUpdateEmail(auth.currentUser, email);
        },

        async updateUserPassword(context, { password }) {
            if (password.trim() === '') {
                throw { code: 'auth/missing-password' };
            }

            await updatePassword(auth.currentUser, password);
        },

        async deleteUser(context) {
            await deleteUser(auth.currentUser);
            context.commit('SET_USER', null);
        },

        async reauthenticateUser(context, authCredential) {
            const userCredential = await reauthenticateWithCredential(auth.currentUser, authCredential);

            if (userCredential) {
                context.commit('SET_USER', userCredential.user);
            }
        },
    },
});

auth.onAuthStateChanged((user) => {
    store.dispatch('setUser', user);
});

export default store;
