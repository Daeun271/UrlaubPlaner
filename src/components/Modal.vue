<template>
    <div class="modal-bg">
        <div class="modal-container">
            <button class="modal-close" @click="$emit('closeModal')"></button>
            <div class="content">
                <slot></slot>
            </div>
            <div class="footer">
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default{
    name: 'Modal',
    emits: ['closeModal']
}
</script>

<style scoped>
.modal-bg {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.modal-container {
    position: absolute;
    padding: 15px;
    border-radius: 15px;
    width: 80%;
    max-height: 80%;
    overflow-y: auto;
    background: #fff;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 7px 7px 5px rgba(0, 0, 0, 0.2);

    display: flex;
    flex-direction: column;
    gap: 15px;
}

.modal-close {
    margin-left: auto;
    width: 20px;
    height: 20px;
    background: url(../assets/icons/icons8-stornieren.svg) no-repeat center;
    background-size: 100%;
    border: none;
    cursor: pointer;
}

.content {
    max-height: 60%;
    overflow-y: auto;
}
</style>