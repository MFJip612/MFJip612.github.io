<template>
    <section class="about-page">
        <div class="container mx-auto px-4 py-12 flex flex-col items-center">
            <h1 id="about" class="about-title text-center text-6xl font-meletery">
                <span>- AB<i class="fa-solid fa-earth-asia animate-spin mx-2"></i>UT -</span>
            </h1>

            <div class="w-full mt-10 flex flex-col md:flex-row gap-8 items-start">
                <!-- left: avatar & meta -->
                <aside class="left md:w-1/3 flex flex-col items-center">
                    <img :src="Logo" alt="Avatar"
                        class="w-44 h-44 md:w-56 md:h-56 rounded-full object-cover shadow-xl" />

                    <div class="meta mt-6 w-full bg-white/5 p-4 rounded-lg text-left">
                        <dl class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                            <div>
                                <dt class="font-semibold">NAME</dt>
                                <dd>MFJip</dd>
                            </div>
                            <div>
                                <dt class="font-semibold">FROM</dt>
                                <dd>Yunfu, Guangdong, China</dd>
                            </div>
                            <div>
                                <dt class="font-semibold">BIRTH</dt>
                                <dd>2008.06.12</dd>
                            </div>
                            <div>
                                <dt class="font-semibold">CONTACT</dt>
                                <dd>
                                    <a class="underline" href="https://github.com/MFJip612" target="_blank"
                                        rel="noopener">Github</a>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </aside>

                <!-- right: intro, interests, contact -->
                <main class="right md:flex-1">
                    <section class="intro mb-8">
                        <h2 class="text-2xl font-meletery mb-3">Introduction</h2>
                        <p class="text-lg leading-relaxed">
                            A student who is insterested in website development.
                        </p>
                    </section>

                    <section class="interests mb-8">
                        <h3 class="text-xl font-semibold mb-4">Tech Stack</h3>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <article v-for="techStack in techStacks" :key="techStack.id"
                                class="card bg-white/3 rounded-lg p-3 flex flex-col">
                                <img :src="techStack.image" alt="techStack.title"
                                    class="w-full h-40 object-cover rounded" />
                                <div class="mt-3 flex-1">
                                    <h4 class="font-semibold">{{ techStack.title }}</h4>
                                    <p class="text-sm mt-2">{{ techStack.desc }}</p>
                                </div>
                                <div class="mt-3">
                                    <a :href="techStack.url" target="_blank" rel="noopener"
                                        class="inline-block px-3 py-1 rounded bg-primary text-sm">visit »</a>
                                </div>
                            </article>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Logo from '@/assets/images/logo.jpg'

const techStacks = [
    {
        id: 1,
        title: 'Vue.js',
        desc: 'A progressive JavaScript framework for building user interfaces.',
        image: 'https://placehold.co/350x350?text=Vue.js',
        url: 'https://vuejs.org/'
    },
    {
        id: 2,
        title: 'Cloudflare Workers',
        desc: 'A cloud platform for building fast, global, and secure applications.',
        image: 'https://placehold.co/350x350?text=Cloudflare+Workers',
        url: 'https://workers.cloudflare.com/'
    },
    {
        id: 3,
        title: 'Vike',
        desc: 'A framework for building serverless websites.',
        image: 'https://placehold.co/350x350?text=Vike',
        url: 'https://vike.dev/'
    }
]
</script>

<style scoped>
/* Global theme variables — light mode defaults, dark overrides via .dark class on <html> */
:root {
    --container-height: calc(100vh - 6rem);
    --bg-start: #f8fafc;
    --bg-end: #ffffff;
    --primary: #2563eb;
    --primary-2: #60a5fa;
    --card-bg: rgba(15, 23, 42, 0.02);
    --meta-dt: #0b61ff;
    --input-bg: rgba(15, 23, 42, 0.02);
    --input-border: rgba(15, 23, 42, 0.06);
    --btn-text: #731516;
}

.dark {
    --bg-start: #0f172a;
    --bg-end: #0b1220;
    --primary: #ff6b6b;
    --primary-2: #ff9a9a;
    --card-bg: rgba(255, 255, 255, 0.03);
    --meta-dt: #cfe7ff;
    --input-bg: rgba(255, 255, 255, 0.03);
    --input-border: rgba(255, 255, 255, 0.06);
    --btn-text: #102030;
}

.about-page {
    background: linear-gradient(180deg, var(--bg-start), var(--bg-end));
    color: var(--text-color);
}

.about-title {
    letter-spacing: .2em;
}

.meta dt {
    color: var(--meta-dt);
}

.input {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    padding: .6rem .75rem;
    border-radius: .5rem;
    color: var(--text-color);
}

.btn-primary {
    background: linear-gradient(90deg, var(--primary), var(--primary-2));
    color: var(--btn-text);
    padding: .5rem 1rem;
    border-radius: .5rem;
    font-weight: 600;
}

.card img {
    border-radius: .5rem;
}

.bg-primary {
    background: linear-gradient(90deg, var(--primary), var(--primary-2));
}

.container {
    min-height: var(--container-height);
}
</style>
