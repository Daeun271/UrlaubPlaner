<template>
    <div>
        <label :for="labelId" style="font-weight: 700">{{ labelText }}</label
        ><span v-if="isImportant" style="color: red !important; display: inline; float: none; margin: 3px">*</span>
        <br />
        <input
            :id="labelId"
            :type="inputType"
            class="form-input"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
        />
    </div>
</template>

<script>
export default {
    name: 'Input',
    props: {
        labelId: String,
        labelText: String,
        isImportant: Boolean,
        inputType: String,
        modelValue: String,
    },
    emits: ['update:modelValue'],
};
</script>

<style scoped>
.form-input {
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

.form-input:focus {
    outline: none;
    border-color: rgb(59 130 246);
}
</style>
