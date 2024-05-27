<template>
    <button class="btn">
        <div class="container" @click="$emit('planClick')">
            <p class="p-1">{{ countryNameTxt }}</p>
            <p class="p-2">{{ travelDuration }}</p>
        </div>
        <img src="../assets/icons/icons8-aktie-3.svg" alt="Invite" @click="$emit('invideClick')" />
    </button>
</template>

<script>
export default {
    name: 'TripContainer',
    emits: ['planClick', 'invideClick'],
    props: {
        countryNameTxt: String,
        travelDuration: String,
    },
};
</script>

<style scoped>
.btn {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 30px;
    margin-bottom: 30px;
    color: black;
    background-color: white;
    border-style: solid;
    border-color: #bdc3c7;
    border-radius: 0.375rem;
    box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.btn:hover {
    border-color: #616467;
}

.container {
    text-align: left;
    width: 100%;
    cursor: pointer;
}

.p-1 {
    font-size: 20px;
    font-weight: 700;
    margin: 0px;
}

.p-2 {
    font-size: 15px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 0px;
}

img {
    cursor: pointer;
}
</style>
