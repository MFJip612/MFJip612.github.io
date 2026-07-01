<script setup lang="ts">
/**
 * LucideIcon — minimal inline SVG icons for the design system.
 * 1:1 with the lucide@1.8.0 set used by the source design.
 * No external dependency; strokes inherit `currentColor`.
 */
import { computed } from 'vue'

type IconName = 'github' | 'twitter' | 'mail' | 'arrow-left'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    strokeWidth?: number
  }>(),
  { size: 16, strokeWidth: 2 }
)

const sizeAttr = computed(() => String(props.size))
const svgAttrs = computed(() => ({
  width: sizeAttr.value,
  height: sizeAttr.value,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': String(props.strokeWidth),
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
}))
</script>

<template>
  <!-- github -->
  <svg
    v-if="name === 'github'"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="svgAttrs"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>

  <!-- twitter -->
  <svg
    v-else-if="name === 'twitter'"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="svgAttrs"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.1 3.8 2.5c2.4 2.8 5.9 4.5 9.7 4.7-.5-2.3.6-4.7 2.5-6 2.2 0 4 1.6 4 1.6z" />
  </svg>

  <!-- mail -->
  <svg
    v-else-if="name === 'mail'"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="svgAttrs"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>

  <!-- arrow-left -->
  <svg
    v-else-if="name === 'arrow-left'"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="svgAttrs"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
</template>