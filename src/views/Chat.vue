<template>
    <div>
        <div ref="scrollDiv" class="messages-scroll">
            <div class="messages">
                <template v-for="(messages, index) in messageGroups" :key="index">    
                    <div v-if="index === 0 || (index>=1 && messages.date.toDateString() !== messageGroups[index - 1].date.toDateString())" class="date">
                        <p>{{ messages.date.toDateString() }}</p>
                    </div>
                    <div v-for="message in messages.messages" :key="message.id" :class="getClassObject(message).divClass">
                        <div class="message">
                            <img :src="memberPhotoURLs[message.creator]" alt="User profile" :class="getClassObject(message).imgClass" />
                            <p :class="getClassObject(message).pClass">{{ message.message }}</p>
                        </div>
                        <span :class="getClassObject(message).spanClass">{{ getTime(message) }}</span>    
                    </div>
                </template>
            </div>
        </div>
        <div class="send-container">
            <input @keyup.enter="sendMessage" type="text" v-model="message" placeholder="Enter your message" />
            <button @click="sendMessage">Send</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { db } from '../firebaseConfig.js'
import { doc, collection, getDoc, getDocs, addDoc, serverTimestamp, query, where, documentId } from "firebase/firestore";
import altImg from '@/assets/icons/icons8-profilbild-100.png?url'

const store = useStore();
const route = useRoute();
const tripId = route.params.groupId;
const messageCollection = collection(db, "trips", tripId, "chatMessages");

const messageGroups = ref([]);
const message = ref('');
const userId = store.state.user.uid;
const userPhoto = computed(store.state.user.photoURL ? store.state.user.photoURL : altImg);
const memberPhotoURLs = ref({});
const getTime = ref((message)=>{
    if(message.createdAt instanceof Date){
        return message.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    return new Date(message.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
})

const addNewMessage = (message) => {
    const date = message.createdAt instanceof Date ? message.createdAt : message.createdAt.toDate();

    if (messageGroups.value.length === 0){
        const messageGroup = {
            date,
            messages: [message]
        };
        messageGroups.value = [messageGroup];
        return;
    }

    let lastGroup = messageGroups.value[messageGroups.value.length-1];

    if (lastGroup.date === date.toDateString()) {
        lastGroup.messages.push(message);
    } else {
        const messageGroup = {
            date,
            messages: [message]
        };
        messageGroups.value = [...messageGroups.value, messageGroup];
    }
}

onMounted(async () => {
    const messageDocs = await getDocs(messageCollection);

    if(messageDocs.empty){
        return;
    }

    let messages = messageDocs.docs.map(doc => doc.data());
    messages.sort((a, b) => a.createdAt - b.createdAt);
    messages.forEach(message => addNewMessage(message));

    const docRef = doc(db, "trips", tripId);
    const docSnap = await getDoc(docRef);
    const membersField = docSnap.data().members;
    const q = query(collection(db, "users"), where(documentId(), "in", membersField));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        memberPhotoURLs.value[doc.id] = doc.data().photoURL==='DEFAULT' ? altImg : doc.data().photoURL;
    });
});

const scrollDiv = ref(null);
let shouldScroll = true;
onUpdated(() => {
    if (shouldScroll) {
        scrollDiv.value.scrollTop = scrollDiv.value.scrollHeight;
    }
    shouldScroll = false;
});

watch(() => messageGroups, (newVal) => {
    shouldScroll = true;
}, { deep: true });

const getClassObject = (message) => {
    const isCurrentUser = message.creator === userId;

    return {
        divClass: isCurrentUser ? 'chat-container darker' : 'chat-container',
        imgClass: isCurrentUser ? 'right' : '',
        pClass: isCurrentUser ? 'right' : '',
        spanClass: isCurrentUser ? 'time-left' : 'time-right'
    };
}

const sendMessage = async () => {
    if (message.value === '') {
        return;
    }

    const newMessage = {
        message: message.value,
        creator: userId,
        createdAt: serverTimestamp(),
    };
    await addDoc(messageCollection, newMessage);

    newMessage.createdAt = new Date();
    addNewMessage(newMessage);
    memberPhotoURLs.value[userId] = userPhoto.value;
    message.value = '';
}
</script>

<style scoped>
.messages-scroll {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 30px 50px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
}

.messages {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
}

.chat-container {
    border: 2px solid #dedede;
    background-color: #f1f1f1;
    border-radius: 5px;
    padding: 15px;
}

.darker {
    border-color: #8aabc1;
    background-color: #c9ddec;
}

.message {
    display: flex;
    flex-direction: row;
    column-gap: 20px;
}

img {
    order: 1;
    width: 40px;
    height: 100%;
    border-radius: 50%;
}

img.right {
    order: 2;
}

.message > p {
    order: 2;
    width: 100%;
    margin: 0;
}

p.right {
    order: 1;
}

.time-right {
    float: right;
    color: #aaa;
    margin: 10px 0 0 0;
}

.time-left {
    float: left;
    color: #999;
    margin: 10px 0 0 0;
}

.send-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

input {
    width: 100%;
    border: 1px solid #dedede;
    border-radius: 20px;
    background-color: #dedede;
    padding: 10px;
    font-size: 16px;
}

input:focus {
    border: 1px solid #dedede;
    outline: none;
}

button {
    width: 5rem;
    padding: 10px 20px;
    margin-left: 10px;
    font-size: 16px;
    background-color: #1994eb;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
}

button:hover {
    background-color: #0e6ab7;
}

.date {
    display: flex;
    justify-content: center;
    text-align: center;
    color: #999;
    background-color: #f1f1f1;
    font-size: 14px;
    border: 2px solid #bab9b9;
    border-radius: 5px;
    padding: 5px 10px;
    margin: 0 auto;
}

.date > p {
    margin: 0;
}
</style>