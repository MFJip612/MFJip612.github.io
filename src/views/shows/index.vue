<template>
    <div class="shows-container">
        <div>
            <h1>Shows</h1>
        </div>
        <Player :url="videoUrl" :srt="srtUrl"></Player>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePageContext } from 'vike-vue/usePageContext';
import Player from '@/components/Player.vue';

const pageContext = usePageContext();
const searchParams = computed(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    const url = pageContext.urlOriginal || '/';
    return new URL(url, window.location.origin).searchParams;
});
const videoUrl = computed(() => searchParams.value.get('url') || '');
const srtUrl = computed(() => searchParams.value.get('srt') || '');
</script>

<style scoped>
.video-player {
    width: 100%;
    height: 100%;
}
</style>