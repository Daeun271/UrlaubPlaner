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
import { db } from "./firebaseConfig.js";
import { doc, setDoc, } from "firebase/firestore";

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
        user (state) {
            return state.user;
        },
        isLoggedIn (state) {
            return state.user !== null;
        },
        userPromise (state) {
            return state.userPromise;
        },
        headerLinks (state) {
            return state.headerLinks;
        },
    },
    mutations: {
        SET_USER (state, user) {
            state.user = user;
            userPromiseResolve(user);
        },
        SET_HEADER_LINKS (state, links) {
            state.headerLinks = links;
        },
    },
    actions: {
        async register (context, { email, password, name }) {
            if(name.trim() === ""){
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

            await updateProfile(response.user, { displayName: name });
            await setDoc(doc(db, "users", response.user.uid), {
                displayName: name,
                photoURL: "DEFAULT",
                trips: [],
            }, { merge: true });

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
                return response;
            }
        },
        
        setHeaderLinks (context, links) {
            context.commit("SET_HEADER_LINKS", links);
        },
    },
});

auth.onAuthStateChanged (user => {
    store.dispatch("setUser", user);
});

export default store;
