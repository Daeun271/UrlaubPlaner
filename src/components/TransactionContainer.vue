<template>
    <div class="transaction-container">
        <div class="amount-container">
            <p>{{ amountAndFromCurrency }}</p><span>{{ amountAndToCurrency }}</span>
        </div>
        <p>{{ descriptionTxt }}</p>
        <p>{{ date }}</p>
        <div class="img-container">
            <div class="user-container">
                <p class="user-name">paid by</p>
                <p>{{ userName }}</p>
                <img :src="userPhoto" alt="user photo" style="width:30px; height:30px;">
            </div>
            <div class="setting-container">
                <img src="../assets/logos/icons8-einstellungen.svg" alt="Change" @click="$emit('editClick')" class="image">
                <img src="../assets/logos/icons8-stornieren.svg" alt="Remove" @click="$emit('removeClick')" class="image">
            </div>
        </div>
    </div>
</template>

<script>
import { Timestamp } from "firebase/firestore";
import { convertCurrency } from '../currencyExchange.js';
export default{
    name: 'TransactionContainer',
    emits: ['editClick', 'removeClick'],
    props: {
        amountTxt: Number,
        fromCurrency: String,
        toCurrency: String,
        descriptionTxt: String,
        dateTxt: Object,
        userPhoto: String,
        userName: String
    },
    data() {
        return {
            amountAndToCurrency: '',
        };
    },
    created() {
        convertCurrency(this.amountTxt, this.fromCurrency, this.toCurrency).then((result) => {
            const toCurrencyFormat = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: this.toCurrency,
            });
            this.amountAndToCurrency = toCurrencyFormat.format(result);
        });
    },
    computed: {
        date() {
            const date = new Date(this.dateTxt.toDate().toDateString());
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        amountAndFromCurrency() {
            const fromCurrencyFormat = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: this.fromCurrency,
            });
            return fromCurrencyFormat.format(this.amountTxt);
        },
    }
}
</script>

<style scoped>
.transaction-container {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    margin-top: 30px;
    padding: 1.5rem;
    background-color: white;
    border: 1px solid #1994eb;
    border-radius: 0.375rem;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.amount-container > p {
    margin: 0 5px 0 0;
    display: inline;
}

.amount-container > span {
    color: #1994eb;
    display: inline;
}

p {
    margin: 0px;
}

img {
    margin: 0px;
}

.img-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.user-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
}

.user-container > p {
    margin: 0px;
}

.user-name {
    color: #373b3e;
}

.setting-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    column-gap: 10px;
}

.image {
    cursor: pointer;
}
</style>