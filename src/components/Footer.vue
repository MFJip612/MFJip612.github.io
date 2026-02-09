<template>
    <footer data-footer class="footer">
        <Ads></Ads>
        <span class="material-symbols-outlined"> location_on </span><span> 广州 </span> | <span> © 2025 MFJip612 </span> |
        <a href="https://icp.gov.moe/?keyword=20229994" target="_blank">萌ICP备20229994号</a>
    </footer>
</template>
<script setup>
import Ads from "./Ads.vue";
</script>
<style scoped>
.footer {
    width: 100%;
    height: var(--footer-height);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    box-shadow: 0 -0.125rem 0.5rem var(--color-shadow);
    background-color: var(--color-background);
    z-index: 999;
    /* position: absolute;
    left: 0;
    bottom: 0;
    margin-top: var(--footer-height); */
}
</style>