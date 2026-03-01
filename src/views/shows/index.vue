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
import { useRoute } from 'vue-router';
import Player from '@/components/player.vue';

const route = useRoute();
const videoUrl = computed(() => route.query.url || '');
const srtUrl = computed(() => route.query.srt || '');
</script>

<style scoped>
.video-player {
    width: 100%;
    height: 100%;
}
</style>