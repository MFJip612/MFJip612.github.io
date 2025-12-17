<template>
    <div class="spotlight">
        <h1
            :data-content="text"
            id="spotlight"
            data-only
            @click="RandomAnimate">
            {{ text }}
        </h1>
    </div>
</template>
<script setup>
const animates = [
    "animate__bounce",
    "animate__flash",
    "animate__pulse",
    "animate__rubberBand",
    "animate__shakeX",
    "animate__shakeY",
    "animate__headShake",
    "animate__swing",
    "animate__tada",
    "animate__wobble",
    "animate__jello",
    "animate__heartBeat",
];

function getRandomAnimate() {
    const index = Math.floor(Math.random() * animates.length);
    return animates[index];
}

function RandomAnimate() {
    let timer = setInterval(() => {
        const h1 = document.querySelector("#spotlight");
        if (h1) {
            h1.className = `animate__animated ${getRandomAnimate()}`;
        }
        clearInterval(timer);
    }, 300);
}

const text = "Hello, World!";
</script>
<style scoped>
* {
    text-align: center;
}
.spotlight {
    /* background-color: #222; */
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: var(--container-height);
}
h1[data-only] {
    font-weight: bold;
    color: #333;
    font-family: Helvetica, "Open Sans", sans-serif;
    margin: 0;
    padding: 0;
    font-size: 8rem;
    /* letter-spacing: -0.3rem; */
    position: relative;
}
h1[data-only]::after {
    font-weight: bold;
    content: attr(data-content);
    color: transparent;
    position: absolute;
    top: 0;
    left: 0;
    -webkit-clip-path: ellipse(6.25rem 6.25rem at 0% 50%);
    clip-path: ellipse(6.25rem 6.25rem at 0% 50%);
    animation: spotlight 5s infinite;
    background-image: linear-gradient(
        69.7deg,
        rgba(244, 37, 243, 1) 1.4%,
        rgba(244, 87, 1, 1) 36.2%,
        rgba(255, 204, 37, 1) 72.2%,
        rgba(20, 196, 6, 1) 113%
    );
    background-position: center center;
    -webkit-background-clip: text;
    background-clip: text;
}

@keyframes spotlight {
    0% {
        -webkit-clip-path: ellipse(6.25rem 6.25rem at 0% 50%);
        clip-path: ellipse(6.25rem 6.25rem at 0% 50%);
    }

    50% {
        -webkit-clip-path: ellipse(6.25rem 6.25rem at 100% 50%);
        clip-path: ellipse(6.25rem 6.25rem at 100% 50%);
    }

    100% {
        -webkit-clip-path: ellipse(6.25rem 6.25rem at 0% 50%);
        clip-path: ellipse(6.25rem 6.25rem at 0% 50%);
    }
}
</style>
