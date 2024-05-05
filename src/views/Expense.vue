<template>
    <div class="bg">
        <div class="header">
            <div class="budget-container">
                <p>Budget: {{ budgetAndFromCurrency }}</p><span>{{ budgetAndToCurrency }}</span>
            </div>
            <div class="expense-container">
                <p>Expense so far: {{ summedExpenseAndFromCurrency }}</p><span>{{ summedExpenseAndToCurrency }}</span>
            </div>
        </div>
        <p style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0">Insert your expenses and split them with your friends</p>
        <div class="add-container">
            <label for="amount" style="font-weight: 700;">Amount in {{ fromCurrency }}</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
            <br/>
            <input id="amount" type="number" v-model="amount" class="form-input"/>
            <Input labelId="description" labelText="Description" inputType="text" v-model="description" :isImportant="true"/>
            <label for="date" style="font-weight: 700;">Date</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
            <br/>
            <input id="date" type="date" :min="arrivalDate" :max="departureDate" v-model="date" class="form-input"/>
            <Button btnText="Submit" class="btn-primary" @click="addTransaction" @keyup.enter="addTransaction" style="width:100%; margin-top:0.75rem;"/>
            <p class="form-error">{{ errorMessage }}</p>
        </div>
        <div>
            <TransactionContainer v-for="transaction in transactions" :key="transaction.id" :amountTxt="transaction.amount" :fromCurrency="fromCurrency" :toCurrency="toCurrency" :descriptionTxt="transaction.description" :dateTxt="transaction.date" :userPhoto="transaction.userPhoto" :userName="transaction.userName"
            @editClick="editTransaction(transaction)" @removeClick="removeTransaction(transaction)" />
        </div>

        <Modal v-if="isPoppedUp" @closeModal="closeModal">
            <div class="edit-container">
                <label for="amount" style="font-weight: 700;">Amount in {{ fromCurrency }}</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
                <br/>
                <input id="amount" type="number" v-model="amount" class="form-input"/>
                <Input labelId="description" labelText="Description" inputType="text" v-model="description" :isImportant="true"/>
                <label for="date" style="font-weight: 700;">Date</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
                <br/>
                <input id="date" type="date" :min="arrivalDate" :max="departureDate" v-model="date" class="form-input"/>
            </div>
            <template v-slot:footer>
                <div>
                    <Button btnText="Edit" class="btn-primary" @click="rewriteTransaction" @keyup.enter="rewriteTransaction" style="width:100%; height:45px; margin-top:0.5rem;"/>
                    <p class="form-error">{{ errorMessage }}</p>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { useStore } from 'vuex'
import { db } from '../firebaseConfig.js'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { convertCurrency } from '../currencyExchange';
import { isoCurrenciesByIsoCountry } from '../currencyCode';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import TransactionContainer from '../components/TransactionContainer.vue';
import Modal from '../components/Modal.vue';
import altImg from '@/assets/logos/icons8-profilbild-100.png?url'

const route = useRoute();
const tripId = route.params.groupId;
const tripRef = doc(db, "trips", tripId);
const tripSnap = getDoc(tripRef);

let budget = 0;
const fromCurrency = ref('');
const toCurrency = ref('');
const budgetAndFromCurrency = ref('');
const budgetAndToCurrency = ref('');
const summedExpenseAndFromCurrency = ref('');
const summedExpenseAndToCurrency = ref('');

const fetchData = async () => {
    const tripData = (await tripSnap).data();
    const todoActivities = tripData.todoActivities;
    const transactions = tripData.transactions;
    fromCurrency.value = tripData.currency;
    toCurrency.value = isoCurrenciesByIsoCountry[tripData.country];
    
    budget = todoActivities.reduce((acc, activity) => acc + activity.expectedExpense, 0);
    const summedExpense = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    
    return { budget, summedExpense };
};

const updateCurrencyFormats = async () => {
    const fromCurrencyFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: fromCurrency.value,
    });
    const toCurrencyFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: toCurrency.value,
    });
    
    return { fromCurrencyFormat, toCurrencyFormat };
};

const updateUI = async () => {
    const { budget, summedExpense } = await fetchData();
    const { fromCurrencyFormat, toCurrencyFormat } = await updateCurrencyFormats();

    // Update budget UI
    budgetAndFromCurrency.value = fromCurrencyFormat.format(budget);
    budgetAndToCurrency.value = toCurrencyFormat.format(await convertCurrency(budget, fromCurrency.value, toCurrency.value));
    // Update summed expense UI
    summedExpenseAndFromCurrency.value = fromCurrencyFormat.format(summedExpense);
    summedExpenseAndToCurrency.value = toCurrencyFormat.format(await convertCurrency(summedExpense, fromCurrency.value, toCurrency.value));
};

updateUI();

const transactions = ref([]);
const amount = ref(0);
const description = ref('');
const date = ref('');
const arrivalDate = ref('');
const departureDate = ref('');
const errorMessage = ref('');
const isPoppedUp = ref(false);

const store = useStore();
const userName = store.state.user.displayName;
const userPhoto = computed(() => { return store.state.user.photoURL ? store.state.user.photoURL : altImg });

const initializeInput = () => {
    amount.value = 0;
    description.value = '';
    date.value = '';
}

const closeModal = () => {
    isPoppedUp.value = false;
}

const convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp.toDate().toDateString());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const validateAndGetTransaction = () => {
    if (amount.value === 0 || description.value === '' || date.value === '') {
        errorMessage.value = 'Please fill in all fields';
        return null;
    }

    errorMessage.value = '';

    return {
        'amount': amount.value,
        'description': description.value,
        'date': Timestamp.fromDate(new Date(date.value)),
        'userPhoto': userPhoto.value,
        'userName': userName
    }
}

const addTransaction = async () => {
    let transaction = validateAndGetTransaction();

    if (!transaction) {
        return;
    }

    if(transactions.value.some((trans) => (trans.amount === transaction.amount)&&(trans.description === transaction.description)&&(trans.date === transaction.date))){
        errorMessage.value = 'The transaction is already added.'
        return;
    }

    await updateDoc(tripRef, {
        transactions: arrayUnion(transaction),
    });
    transactions.value = [...transactions.value, transaction].sort((a, b) => b.date - a.date);

    initializeInput();
    isPoppedUp.value = false;
}

let oldTransaction = null;
const editTransaction = async (transaction) => {
    amount.value = transaction.amount;
    description.value = transaction.description;
    date.value = convertTimestampToDate(transaction.date);
    oldTransaction = transaction;
    isPoppedUp.value = true;
}

const rewriteTransaction = async () => {
    let newTransaction = validateAndGetTransaction();

    if (!newTransaction) {
        return;
    }

    await removeTransaction(oldTransaction);
    addTransaction();
}

const removeTransaction = async (transaction) => {
    await updateDoc(tripRef, {
        transactions: arrayRemove(transaction),
    });

    let index = transactions.value.indexOf(transaction);
    transactions.value.splice(index, 1);
}

onMounted(async () => {
    const tripData = (await tripSnap).data();
    arrivalDate.value = convertTimestampToDate(tripData.arrivalDate);
    departureDate.value = convertTimestampToDate(tripData.departureDate);

    if(tripData.transactions.length === 0){
        return;
    }

    transactions.value = tripData.transactions.sort((a, b) => b.date - a.date);
});
</script>

<style scoped>
.bg {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 30px 70px 30px 70px;
}

.header {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 15px;
    margin-bottom: 30px;
    background-color: #b5d6ef;
    border: 1px solid #1994eb;
    border-radius: 5px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    font-size: 18px;
    font-weight: bold;
}

.budget-container > p, .expense-container > p {
    margin: 0 5px 0 0;
    display: inline;
}

.budget-container > span, .expense-container > span {
    color: #1994eb;
    display: inline;
}

.add-container {
    border: 1px solid #1994eb;
    border-radius: 0.375rem;
    background-color: white;
    padding: 1.5rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.form-input {
    width: 100%;
    height: 30px;
    border: 1px solid rgb(209 213 219);;
    border-radius: 0.375rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    padding: 0.375rem 0.75rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-error {
    color: #DC2626;
    font-size: 12px;
    margin-top: 0.25rem;
    margin-bottom: 0;
}

.edit-container {
    width: 100%;
    padding: 1.5rem;
}
</style>