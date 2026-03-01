<template>
    <dialog class="Message" ref="dialogEl">
        <div class="dialog-content">
            <div class="dialog-main-content">
                <slot name="title" class="title"></slot>
                <slot class="content"></slot>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialogEl = ref(null)

function show() {
    dialogEl.value?.showModal()
}

function hide() {
    dialogEl.value?.close()
}

defineExpose({ show, hide })
</script>

<style scoped>
:root {
    font-size: 0.9rem;
}

.Message {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 50vw;
    height: 50vh;
    display: none;
    justify-content: center;
    align-items: center;
    background: transparent;
}

.Message[open] {
    display: flex;
}

.dialog-content {
    --border-width: .4rem;
    --border-radius: .35rem;
    --background-spread: 12.5rem;

    padding: var(--border-width);
    border-radius: var(--border-radius);
    background-color: transparent;

    font-weight: bold;
    position: relative;
    border: 0;

    overflow: hidden;
}

.dialog-content>.dialog-main-content {
    padding: 2rem;
    border-radius: calc(var(--border-radius) - var(--border-radius) / 2);
    background-color: var(--background);
}

.dark .dialog-main-content {
    background-color: #111;
    color: #fff;

    gap: .2rem;
}

.dialog-content::after {
    content: '';
    position: absolute;
    background: linear-gradient(135deg, #8B00FF 0%, #FF1493 33%, #00BFFF 66%, #00FF7F 100%);
    top: calc(var(--background-spread) * -1);
    right: calc(var(--background-spread) * -1);
    bottom: calc(var(--background-spread) * -1);
    left: calc(var(--background-spread) * -1);
    z-index: -1;
    animation: rotate 3s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>