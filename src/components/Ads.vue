<template>
    <ins class="adsbygoogle" data-ad-client="ca-pub-3433477986485987" :data-ad-slot="adSlot" :data-ad-format="adFormat"
        :style="adStyle"></ins>
</template>
<script setup>
import { onMounted } from 'vue';

const props = defineProps({
    adSlot: {
        type: String,
        default: '0000000000'
    },
    adFormat: {
        type: String,
        default: 'auto'
    },
    adStyle: {
        type: [String, Object],
        default: () => ({ display: 'block' })
    }
});

onMounted(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
});
</script>
<style></style>