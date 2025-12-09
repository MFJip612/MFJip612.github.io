<template>
    <Spotlight />
    <div class="personal-information">
        <span class="material-symbols-outlined"> location_on </span>
        Guangzhou, China
    </div>
</template>
<style scoped>
.personal-information {
    position: fixed;
    justify-content: center;
    align-items: center;
}
</style>
<script setup>
import Spotlight from "@/components/spotlight.vue";
</script>
