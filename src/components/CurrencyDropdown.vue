<template>
    <div>
        <label for="currency" style="font-weight: 700">Currency</label>
        <select v-model="model" id="currency" name="currency" class="form-control">
            <option v-for="currency in isoCurrencies" :key="currency" :value="currency">{{ currency }}</option>
        </select>
    </div>
</template>

<script setup>
import { defineModel } from 'vue';
import { isoCurrencies } from '../currencyCode.js';

const model = defineModel();
</script>

<style scoped>
.form-control {
    width: 100%;
    height: 30px;
    border: 1px solid rgb(209 213 219);
    border-radius: 0.375rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    padding: 0.375rem 0.75rem;
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    outline: none;
    border-color: rgb(59 130 246);
}
</style>
