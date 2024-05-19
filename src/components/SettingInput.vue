<template>
    <label :for="labelId">{{ labelText }}</label>
    <br/>
    <div>
        <input :id="labelId" :type="inputType" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"/>
        <button @click="$emit('buttonClick')">{{ btnText }}</button>
    </div>
    <div style="margin-top: 0.1rem">
        <span :class="{ 'error' : isError }">{{ msgText }}</span>
    </div>
</template>

<script>
export default{
    name: 'Input',
    props: {
        labelId: String,
        labelText: String,
        inputType: String,
        modelValue: String,
        btnText: String,
        msgText: String,
        isError: Boolean,
        mustBeVerified: Boolean,
    },
    emits: ['update:modelValue', 'buttonClick'],
}
</script>

<style scoped>
label {
    font-weight: 700;
}

div {
    display: flex;
    flex-direction: row;
    row-gap: 0.5rem;
    margin-top: 0.5rem;
}

input {
    height: 100%;
    margin: 0 0.5rem 0 0;
    border: 1px solid rgb(209 213 219);;
    border-radius: 0.375rem;
    padding: 0.375rem 0.7rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
} 

input:focus {
    outline: none;
    border-color: rgb(59 130 246);
}

button {
    padding: 7px 0.75rem 7px 0.75rem;
    border-radius: 0.375rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.3s ease;
    outline: none;
    color: white;
    background-color: #1994eb;
    border-style: none;
}

button:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    background-color: #0e6ab7;
}

button:active {
    color: white;
}

span {
    font-size: 0.875rem;
    color: blue;
}

.error {
    color: red;
}
</style>