<template>
    <div class="toast">
        <div class="toast-content">
            <div class="message">
                <span class="text-1">{{ messageTitle }}</span>
                <span class="text-2">{{ messageContent }}</span>
            </div>
        </div>
        <img src="@/assets/icons/icons8-stornieren.svg" alt="Stonieren" @click="$emit('click')" class="close" />
    </div>
</template>

<script>
export default {
    name: 'Toast',
    emits: ['click'],
    props: {
        messageTitle: String,
        messageContent: String,
    },
};
</script>

<style scoped>
.toast {
    position: absolute;
    top: 60px;
    right: 7px;
    border-radius: 12px;
    background-color: #fff;
    max-width: 450px;
    padding: 10px 35px 15px 25px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 1);
    border-left: 6px solid #1994eb;
}

.toast-content {
    display: flex;
    align-items: center;
}

.message {
    display: flex;
    flex-direction: column;
}

.text-1 {
    font-size: 17px;
    font-weight: 600;
    color: #484545;
}

.text-2 {
    font-size: 13px;
    font-weight: 400;
    color: #666666;
}

.close {
    position: absolute;
    top: 10px;
    right: 15px;
    padding: 5px;
    cursor: pointer;
    opacity: 0.7;
}

.close:hover {
    opacity: 1;
}
</style>
