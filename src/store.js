import { createStore } from "vuex";
import { auth, googleProvider } from "./firebaseConfig.js";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
} from "firebase/auth";

let userPromiseResolve = null;
const userPromise = new Promise((resolve, _reject) => {
    userPromiseResolve = resolve;
});

const store = createStore({
    state: {
        user: null,
        userPromise,
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
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user;
            userPromiseResolve(user);
        },
    },
    actions: {
        async register(context, { email, password, name }) {
            if (name.trim() === "") {
                throw { code: "auth/invalid-display-name" };
            }
            const response = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (response) {
                context.commit("SET_USER", response.user);
            }
            try {
                await updateProfile(response.user, { displayName: name });
            } catch (error) {
                await updateProfile(response.user, {
                    displayName: "user-" + response.user.uid.slice(0, 8),
                });
            }
            await sendEmailVerification(response.user);
        },

        async logIn(context, { email, password }) {
            const response = await signInWithEmailAndPassword(auth, email, password);
            if (response) {
                context.commit("SET_USER", response.user);
            }
        },

        async logOut(context) {
            await signOut(auth);
            context.commit("SET_USER", null);
        },

        async resetPassword(context, {email}) {
            await sendPasswordResetEmail(auth, email);
        },

        async setUser(context, user) {
            context.commit("SET_USER", user);
        },

        async googleSignIn(context) {
            const response = await signInWithPopup(auth, googleProvider);
            if (response) {
                context.commit("SET_USER", response.user);
            }
        }
    },
});

auth.onAuthStateChanged(user => {
    store.dispatch("setUser", user);
});

export default store;
