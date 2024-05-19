<template>
    <button class="btn"><img :src="imgSrc" :style="imgStyle">{{ btnText }}</button>
</template>

<script>
export default{
    name: 'Button',
    props: {
        imgSrc: String,
        imgStyle: String,
        btnText: String,
    },
}
</script>

<style scoped>
.btn {
    display: flex;
    align-items:center;
    justify-content: center;
    padding: 10px 0.75rem 10px 0.75rem;
    border-radius: 0.375rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.3s ease;
    outline: none;
}

.btn:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.btn-primary{
    color: white;
    background-color: #1994eb;
    border-style: none;
}

.btn-primary:hover {
    background-color: #0e6ab7;
}
.btn-primary:active {
    color: white;
}

.btn-secondary{
    color: black;
    background-color: white;
    border-style: solid;
    border-width: 1.75px;
    border-color: #1994eb;
}

.btn-secondary:hover {
    border-color: #0e6ab7;
    background-color: #f4f7f9;
}

.btn-secondary:active {
    color: black;
}

.btn-tertiary{
    color: white;
    background-color: #eb4b19;
    border-style: none;
}

.btn-tertiary:hover {
    color: white;
    background-color: #ea633a;
}

img{
    display: flex;
    align-items:center;
    justify-content: center;
}
</style>