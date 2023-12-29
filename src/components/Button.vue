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
    color: white;
    background-color: #1994eb;
    padding: 10px 0.75rem 10px 0.75rem;
    border-style: none;
    border-radius: 0.375rem;
    font-weight: 700;
    white-space: nowrap;
    transition: background-color 0.3s ease;
}
.btn:link {
    color: white;
}
.btn:visited {
    color: white;
}

.btn:hover {
    background-color: #0e6ab7;
}
.btn:active {
    color: white;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.img{
    display: flex;
    align-items:center;
    justify-content: center;
}
</style>