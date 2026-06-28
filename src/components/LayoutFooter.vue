<script setup lang="ts">
/**
 * LayoutFooter — shared by every page.
 */
</script>

<template>
  <footer
    class="layout-footer"
    data-dom-id="global-footer"
  >
    <div class="layout-footer__inner">
      <p class="layout-footer__copy">
        &copy; 2026 MFJip612 &mdash; built with caffeine and curiosity
      </p>
      <p class="layout-footer__echo">
        <span class="layout-footer__echo-dollar">$</span> echo &quot;hello world&quot;
      </p>
    </div>
  </footer>
</template>

<style scoped>
.layout-footer {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--geek-space-lg) 24px 32px;
  border-top: 1px solid var(--geek-border);
}

.layout-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.layout-footer__copy,
.layout-footer__echo {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
  margin: 0;
}

.layout-footer__echo-dollar {
  color: var(--geek-brand-500);
}
</style>
