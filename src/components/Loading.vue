<template>
    <div class="loading-root" :class="{ 'is-active': isActive }">
        <svg class="loading" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin slice" aria-hidden="true">
            <defs>
                <polygon id="loading_hexagon" points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25" fill="#171717" />
            </defs>
        </svg>
    </div>
</template>

<script setup>
import { ref, defineExpose, onUnmounted } from 'vue'

const row = 15
const line = 30
const container = ref(null)
const blocks = ref([])
const centerBlock = ref(null)
const isActive = ref(false)
let timeline = null
let timeoutId = null
let isTransitioning = false

function create_blocks() {
    if (!container.value) return

    let blockIndex = 0
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

            if (l === Math.floor(line / 2) && r === Math.floor(row / 2)) {
                centerBlock.value = use
            }
            blockIndex++
        }
        container.value.appendChild(g)
    }
}

async function playTransitionEnter() {
    if (typeof window === 'undefined') return
    try {
        const { gsap } = await import('gsap')

        if (timeline) timeline.kill()
        timeline = gsap.timeline()

        timeline.set(blocks.value, {
            strokeDashoffset: () => Math.random() > 0.5 ? -150 : 150,
            strokeOpacity: 0,
            scale: 0,
            transformOrigin: 'center'
        })

        if (centerBlock.value) {
            timeline.to(centerBlock.value, {
                scale: 1,
                strokeOpacity: 1,
                strokeDashoffset: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            }, 0)
        }

        timeline.to(blocks.value, {
            strokeDashoffset: 0,
            strokeOpacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power3.inOut',
            stagger: {
                from: 'center',
                grid: [line, row],
                each: 0.015,
                axis: 'xy'
            }
        }, 0.1)

        timeline.to(blocks.value, {
            strokeWidth: 1.5,
            duration: 0.8,
            ease: 'sine.inOut',
            stagger: {
                from: 'random',
                each: 0.005
            },
            yoyo: true,
            repeat: 1
        }, '-=0.4')

    } catch (e) {
        console.error('gsap transition enter failed', e)
    }
}

function exit() {
    return new Promise(async (resolve) => {
        if (typeof window === 'undefined') return resolve()
        try {
            const { gsap } = await import('gsap')

            if (timeline) {
                timeline.kill()
                timeline = null
            }

            timeline = gsap.timeline({
                onComplete: () => resolve(),
                ease: 'power4.inOut'
            })

            timeline.to(blocks.value, {
                scale: 0.3,
                opacity: 0.5,
                rotation: 45,
                duration: 0.5,
                ease: 'back.in(1.7)',
                stagger: {
                    from: 'edges',
                    grid: [line, row],
                    each: 0.008,
                    axis: 'xy'
                }
            })

            timeline.to(blocks.value, {
                scale: 0,
                opacity: 0,
                x: (i, target) => {
                    const centerX = (row / 2) * 86.5 - parseFloat(target.getAttribute('x') || 0)
                    return centerX * 0.3
                },
                y: (i, target) => {
                    const centerY = (line / 2) * 74.5 - parseFloat(target.getAttribute('y') || 0)
                    return centerY * 0.3
                },
                duration: 0.6,
                ease: 'power4.in',
                stagger: {
                    from: 'random',
                    each: 0.006
                }
            }, '-=0.3')

            timeline.set(blocks.value, {
                clearProps: 'all'
            })

        } catch (e) {
            console.error('gsap exit failed', e)
            resolve()
        }
    })
}

function clear() {
    if (timeline) {
        timeline.kill()
        timeline = null
    }
    if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
    }
    if (container.value) {
        container.value.innerHTML = ''
    }
    container.value = null
    blocks.value = []
    centerBlock.value = null
}

function start() {
    if (typeof window === 'undefined') return

    container.value = document.querySelector('.loading')
    if (!container.value) return

    if (blocks.value.length > 0) {
        clear()
        container.value = document.querySelector('.loading')
        if (!container.value) return
    }

    create_blocks()

    timeoutId = window.setTimeout(() => {
        playTransitionEnter()
    }, 50)
}

function startExitAnimation() {
    return new Promise(async (resolve) => {
        if (typeof window === 'undefined' || isTransitioning) {
            resolve()
            return
        }

        isTransitioning = true

        container.value = document.querySelector('.loading')
        if (!container.value) {
            resolve()
            return
        }

        if (blocks.value.length > 0) {
            clear()
            container.value = document.querySelector('.loading')
            if (!container.value) {
                resolve()
                return
            }
        }

        create_blocks()

        await new Promise(resolve2 => setTimeout(resolve2, 50))

        await exit()

        isTransitioning = false
        resolve()
    })
}

defineExpose({
    start,
    exit,
    clear,
    startExitAnimation,
    isActive
})

onUnmounted(() => {
    clear()
    isTransitioning = false
})
</script>

<style scoped>
.loading-root {
    --bg-base: #0a0a0a;
    --bg-gradient-start: rgba(10, 10, 10, 0.98);
    --bg-gradient-mid: rgba(23, 23, 23, 0.95);
    --bg-gradient-end: rgba(5, 5, 5, 0.99);

    --hex-stroke-color: #17f700;
    --hex-stroke-color-glow: rgba(23, 247, 0, 0.6);
    --hex-stroke-width: 0.8;
    --hex-stroke-width-active: 1.5;
    --hex-dash-array: 150;

    --blur-strength: 12px;
    --saturate-strength: 1.2;
    --brightness-strength: 0.4;

    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;

    background:
        radial-gradient(
            ellipse at center,
            transparent 0%,
            rgba(0, 0, 0, 0.4) 100%
        ),
        linear-gradient(
            135deg,
            var(--bg-gradient-start) 0%,
            var(--bg-gradient-mid) 50%,
            var(--bg-gradient-end) 100%
        );

    backdrop-filter:
        blur(var(--blur-strength))
        saturate(var(--saturate-strength))
        brightness(var(--brightness-strength));
    -webkit-backdrop-filter:
        blur(var(--blur-strength))
        saturate(var(--saturate-strength))
        brightness(var(--brightness-strength));
}

.loading-root.is-active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}

.dark .loading-root {
    --bg-gradient-start: rgba(10, 10, 10, 0.97);
    --bg-gradient-mid: rgba(15, 15, 15, 0.96);
    --bg-gradient-end: rgba(5, 5, 5, 0.98);
    --blur-strength: 16px;
    --brightness-strength: 0.3;
}

.loading-root::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.04;
    pointer-events: none;
    z-index: 1;
}

.loading-root::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        ellipse at center,
        transparent 0%,
        transparent 40%,
        rgba(0, 0, 0, 0.3) 70%,
        rgba(0, 0, 0, 0.6) 100%
    );
    pointer-events: none;
    z-index: 2;
}

.loading {
    display: block;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    z-index: 3;
}

.loading_block {
    transform-box: fill-box;
    transform-origin: center;
    stroke: var(--hex-stroke-color);
    stroke-width: var(--hex-stroke-width);
    stroke-dasharray: var(--hex-dash-array);
    stroke-opacity: 0;
    fill: none;

    filter:
        drop-shadow(0 0 4px var(--hex-stroke-color))
        drop-shadow(0 0 8px var(--hex-stroke-color-glow));
    transition: filter 0.3s ease;

    mix-blend-mode: screen;
}

.loading_block:hover {
    filter:
        drop-shadow(0 0 10px var(--hex-stroke-color))
        drop-shadow(0 0 20px var(--hex-stroke-color-glow))
        drop-shadow(0 0 30px var(--hex-stroke-color));
    brightness: 1.4;
}

@media (max-width: 768px) {
    .loading-root {
        --hex-stroke-width: 0.6;
        --hex-dash-array: 100;
        --blur-strength: 10px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .loading-root {
        background: var(--bg-gradient-start);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    }

    .loading-root::before,
    .loading-root::after {
        display: none;
    }

    .loading_block {
        stroke-opacity: 1;
        stroke-dashoffset: 0;
        animation: none;
        transition: none;
    }
}
</style>
