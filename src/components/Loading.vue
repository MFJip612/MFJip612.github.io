<template>
    <div class="loading-root">
        <svg class="loading" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin slice" aria-hidden="true">
            <defs>
                <polygon id="loading_hexagon" points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25" fill="#171717" />
            </defs>
        </svg>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

// Component-local state and methods. Expose `start()` and `exit()` so parent
// can control enter/exit animations.
import { ref, defineExpose } from 'vue'

const row = 15
const line = 30
const container = ref(null)
const blocks = ref([])
let timeline = null
let timeoutId = null

function create_blocks() {
    for (let l = 0; l < line; l++) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        for (let r = 0; r < row; r++) {
            const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
            use.setAttribute('class', 'loading_block')
            use.setAttribute('href', '#loading_hexagon')
            use.setAttribute('x', `${l % 2 ? 86.5 * r : 86.5 * r + 43.3}`)
            use.setAttribute('y', `${74.5 * l}`)
            use.setAttribute('transform-origin', '50 50')
            g.appendChild(use)
            blocks.value.push(use)
        }
        if (container.value) container.value.appendChild(g)
    }
}

async function playEnter() {
    // simple enter animation: reveal strokes
    if (typeof window === 'undefined') return
    try {
        const { gsap } = await import('gsap')
        timeline = gsap.timeline()
        timeline.set(blocks.value, { 'stroke-dashoffset': () => (Math.random() > 0.5 ? -100 : 100) })
        timeline.to(blocks.value, { 'stroke-dashoffset': 0, 'stroke-opacity': 1, duration: 0.5, ease: 'power4.out', stagger: { from: 'random', each: 0.002 } })
    } catch (e) {
        console.error('gsap load failed', e)
    }
}

function start() {
    // find container and build blocks, then schedule enter
    container.value = document.querySelector('.loading')
    if (!container.value) return
    create_blocks()
    timeoutId = window.setTimeout(() => {
        // playEnter can be used to prepare or loop; we keep it simple
        playEnter()
    }, 300)
}

function exit() {
    // play exit animation and return a promise that resolves when done
    return new Promise(async (resolve) => {
        if (typeof window === 'undefined') return resolve()
        try {
            const { gsap } = await import('gsap')
            // if there's an ongoing timeline, kill it
            if (timeline) {
                try { timeline.kill() } catch (e) {}
                timeline = null
            }
            timeline = gsap.timeline({ onComplete: () => resolve() })
            timeline.to(blocks.value, { scale: 0, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: { from: 'center', each: 0.004 } })
        } catch (e) {
            console.error('gsap exit failed', e)
            resolve()
        }
    })
}

function clear() {
    if (timeline) {
        try { timeline.kill() } catch (e) {}
        timeline = null
    }
    if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
    }
    if (container.value) container.value.innerHTML = ''
    container.value = null
    blocks.value = []
}

defineExpose({ start, exit, clear })

let onLoadHandler

onMounted(() => {
    if (typeof window === 'undefined') return
    const initOrBind = () => start()
    if (document.readyState === 'complete') {
        initOrBind()
    } else {
        onLoadHandler = () => initOrBind()
        window.addEventListener('load', onLoadHandler)
    }
})

onUnmounted(() => {
    if (typeof window !== 'undefined' && onLoadHandler) {
        window.removeEventListener('load', onLoadHandler)
    }
    clear()
})
</script>

<style scoped>
.loading-root {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
}

.loading {
    display: block;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

/* Ensure transforms on SVG `use` elements use the element box */
.loading_block {
    transform-box: fill-box;
    transform-origin: center;
}

.loading_block {
    stroke: #17f700;
    stroke-width: 0.8;
    stroke-dasharray: 100;
    stroke-opacity: 0;
}
</style>