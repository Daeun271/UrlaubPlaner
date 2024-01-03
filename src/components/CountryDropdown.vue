<template>
    <div>
        <label for="country" style="font-weight: 700;">Country to travel</label><span style="color: red !important; display: inline; float: none; margin:3px;">*</span>
        <select @click="$emit('selectedCountry', selectedCountryValue)" id="country" name="country" class="form-control" v-model="selectedCountryValue">
            <option v-for="country in countries" :key="country[0]" :value="country[0]">{{ country[1] }}</option>
        </select>
    </div>
</template>

<script>
import { ref } from 'vue';
import { isoCountries } from '../countryCode.js';

export default {
    name: 'CountryDropdown',
    emits: ['selectedCountry'],
    setup(props, { emit }) {
        const selectedCountryValue = ref('');
        const countries = Object.entries(isoCountries);

        emit('selectedCountry');
        return {
            selectedCountryValue,
            countries,
        };
    },
};
</script>

<style scoped>
.form-control {
    width: 100%;
    height: 30px;
    border: 1px solid rgb(209 213 219);;
    border-radius: 0.375rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    padding: 0.375rem 0.75rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    outline: none;
    border-color: rgb(59 130 246);
}
</style>