<template>
    <div class="bg">
        <div class="header">
            <div class="budget-container">
                <p>Budget: {{ budgetAndFromCurrency }}</p><span>{{ budgetAndToCurrency }}</span>
            </div>
            <div class="expense-container">
                <p>Expense so far: {{ summedExpenseAndFromCurrency }}</p><span>{{ summedExpenseAndToCurrency }}</span>
            </div>
            <p v-if="!isSolo" style="margin:0;">{{ individualPaymentAndReception }}</p>
        </div>
        <p style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0">Insert your expenses and split them with your friends</p>
        <div class="add-container">
            <label for="amount" style="font-weight: 700;">Amount in {{ fromCurrency }}</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
            <br/>
            <input id="amount" type="number" v-model="amount" class="form-input"/>
            <Input labelId="description" labelText="Description" inputType="text" v-model="description" :isImportant="true"/>
            <label for="date" style="font-weight: 700;">Date</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
            <br/>
            <input id="date" type="date" :min="departureDate" :max="arrivalDate" v-model="date" class="form-input"/>
            <Button btnText="Submit" class="btn-primary" @click="addTransaction" @keyup.enter="addTransaction" style="width:100%; margin-top:0.75rem;"/>
            <p class="form-error">{{ errorMessage }}</p>
        </div>
        <div>
            <TransactionContainer v-for="transaction in transactions" :key="transaction.id" :amountTxt="transaction.amount" :fromCurrency="fromCurrency" :toCurrency="toCurrency" :descriptionTxt="transaction.description" :dateTxt="transaction.date" :payer="transaction.payer"
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
                <input id="date" type="date" :min="departureDate" :max="arrivalDate" v-model="date" class="form-input"/>
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
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp, collection, getDocs, query, where, documentId } from "firebase/firestore";
import { convertCurrency } from '../currencyExchange';
import { isoCurrenciesByIsoCountry } from '../currencyCode';
import Input from '../components/Input.vue';
import Button from '../components/Button.vue';
import TransactionContainer from '../components/TransactionContainer.vue';
import Modal from '../components/Modal.vue';
import altImg from '@/assets/icons/icons8-profilbild-100.png?url'

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

const getTotalExpenseFromDB = async () => {
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
    const { budget, summedExpense } = await getTotalExpenseFromDB();
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
const userId = store.state.user.uid;

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
        'payer': userId,
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

const isSolo = ref(true);
const individualPaymentAndReception = ref('');

const getMembers = async () => {
    const members = [];

    const tripData = (await tripSnap).data();
    const memberPromises = tripData.members.map(async (memberId) => {
        const memberDoc = await getDoc(doc(db, "users", memberId));
        const memberName = memberDoc.data().displayName;
        const member = {
            id: memberId,
            name: memberName,
            paidAmount: 0,
        };

        transactions.value.forEach((transaction) => {
            if (transaction.payer === memberId) {
                member.paidAmount += transaction.amount;
            }
        });

        members.push(member);
    });

    await Promise.all(memberPromises);
    return members;
}

onMounted(async () => {
    const tripData = (await tripSnap).data();
    arrivalDate.value = convertTimestampToDate(tripData.arrivalDate);
    departureDate.value = convertTimestampToDate(tripData.departureDate);

    if(tripData.transactions.length === 0){
        return;
    }

    transactions.value = tripData.transactions.sort((a, b) => b.date - a.date);

    if (new Date() >= new Date(arrivalDate.value)) {
        const membersNumber = tripData.members.length;

        if (membersNumber === 1) {
            return;
        }

        isSolo.value = false;

        const totalExpense = transactions.value.reduce((acc, transaction) => acc + transaction.amount, 0);
        const individualExpense = (totalExpense / membersNumber).toFixed(2);

        const membersList = await getMembers();
        const lenderList = {};
        const borrowerList = {};

        membersList.forEach((member) => {
            if (member.paidAmount > individualExpense) {
                const lenderData = {
                    'name': member.name,
                    'amountToReceive': (member.paidAmount - individualExpense).toFixed(2),
                    'howMuchFromWhom': '',
                };

                lenderList[member.id] = lenderData;
            } else if (member.paidAmount < individualExpense) {
                const borrowerData = {
                    'name': member.name,
                    'amountToPay': (individualExpense - member.paidAmount).toFixed(2),
                    'howMuchToWhom': '',
                };
                
                borrowerList[member.id] = borrowerData;
            } else {
                individualPaymentAndReception.value = '';
                return;
            }
        });

        membersList.forEach((member) => {
            if (member.id in borrowerList) {
                if (borrowerList[member.id].amountToPay === 0) {
                    return;
                }

                for (const lenderId in lenderList) {
                    if (lenderList[lenderId].amountToReceive === 0) {
                        return;
                    }

                    const amountToTransfer = Math.min(borrowerList[member.id].amountToPay, lenderList[lenderId].amountToReceive).toFixed(2);

                    if (borrowerList[member.id].howMuchToWhom === '') {
                        borrowerList[member.id].howMuchToWhom = `${amountToTransfer} ${fromCurrency.value} to ${lenderList[lenderId].name}`;
                    } else {
                        borrowerList[member.id].howMuchToWhom += `, ${amountToTransfer} ${fromCurrency.value} to ${lenderList[lenderId].name}`;
                    }

                    if (lenderList[lenderId].howMuchFromWhom === '') {
                        lenderList[lenderId].howMuchFromWhom = `${amountToTransfer} ${fromCurrency.value} from ${borrowerList[member.id].name}`;
                    } else {
                        lenderList[lenderId].howMuchFromWhom += `, ${amountToTransfer} ${fromCurrency.value} from ${borrowerList[member.id].name}`;
                    }
                    
                    borrowerList[member.id].amountToPay -= amountToTransfer;
                    lenderList[lenderId].amountToReceive -= amountToTransfer;
                }
            }    
        });

        if (userId in borrowerList) {
            individualPaymentAndReception.value = `You have to pay ${borrowerList[userId].howMuchToWhom}`;
        } else if (userId in lenderList) {
            individualPaymentAndReception.value = `You have to receive ${lenderList[userId].howMuchFromWhom}`;
        }
    }
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

.form-input:focus {
    outline: none;
    border-color: rgb(59 130 246);
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