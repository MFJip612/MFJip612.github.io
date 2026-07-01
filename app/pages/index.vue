<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: '首页 — MFJip612',
})

interface Post {
	id: string
	title: string
	excerpt: string
	date: string
	tags: string[]
	path: string
}

// 获取文章列表（通过 useArticles composable）
const { articles } = useArticles()

// 从文章列表取前 3 篇
const posts = computed<Post[]>(() => {
	return articles.value
		.map((a) => ({
			id: a.id,
			title: a.title,
			excerpt: a.description ?? '',
			date: a.date,
			tags: a.tags ?? [],
			path: `/article/${a.id}`,
		}))
		.sort((a, b) => b.date.localeCompare(a.date))
		.slice(0, 3)
})

const techStack = ['Go', 'Rust', 'TypeScript', 'Kubernetes', 'Linux', 'Neovim', 'Docker', 'PostgreSQL']

// hover state for the article cards
const hoveredCard = ref<string | null>(null)

const asciiLines = [
	' _____ ______   ________    ___  ___  ________  ________   _____    _______     ',
	'|\\   _ \\  _   \\|\\  _____\\  |\\  \\|\\  \\|\\   __  \\|\\   ____\\ / __  \\  /  ___  \\    ',
	'\\ \\  \\\\\\__\\ \\  \\ \\  \\__/   \\ \\  \\ \\  \\ \\  \\|\\  \\ \\  \\___||\\/_|\\  \\/__/|_/  /|   ',
	' \\ \\  \\\\|__| \\  \\ \\   __\\__ \\ \\  \\ \\  \\ \\   ____\\ \\  \\___\\|/ \\ \\  \\__|//  / /    ',
	'  \\ \\  \\    \\ \\  \\ \\  \\_|\\  \\\\_\\  \\ \\  \\ \\  \\___|\\ \\  ___  \\  \\ \\  \\  /  /_/__   ',
	'   \\ \\__\\    \\ \\__\\ \\__\\\\ \\________\\ \\__\\ \\__\\    \\ \\_______\\  \\ \\__\\|\\________\\ ',
	'    \\|__|     \\|__|\\|__| \\|________|\\|__|\\|__|     \\|_______|   \\|__| \\|_______|'
]

const boxedAsciiArt = computed(() => {
	const normalizedLines = asciiLines.map((line) => line.trimEnd())
	const maxLineLength = normalizedLines.reduce((max, line) => Math.max(max, line.length), 0)
	const leftPadding = 3
	const rightPadding = 12
	const horizontalLength = maxLineLength + leftPadding + rightPadding
	const leftSpaces = ' '.repeat(leftPadding)
	const rightSpaces = ' '.repeat(rightPadding)
	const top = `+${'-'.repeat(horizontalLength)}+`
	const middle = normalizedLines.map((line) => `|${leftSpaces}${line.padEnd(maxLineLength, ' ')}${rightSpaces}|`)
	const bottom = `+${'-'.repeat(horizontalLength)}+`

	return [top, ...middle, bottom].join('\n')
})
</script>

<template>
	<main class="page-home">
		<!-- ═══════════════════════════════════════════════════
         HERO SECTION
         ═══════════════════════════════════════════════════ -->
		<section class="hero-banner">
			<div class="hero-panel">
				<div class="terminal-prompt">
					<span class="terminal-prompt__symbol">$</span>
					<span class="terminal-prompt__command">whoami</span>
				</div>
				<div class="hero-content">
					<h1 class="sr-only">MFJip612</h1>
					<pre class="hero-banner__ascii" aria-label="MFJip612">{{ boxedAsciiArt }}</pre>
					<p class="geek-body hero-banner__lead">
						探索技术的无限可能<br />
						<span class="hero-banner__lead-muted">Coder. Student.</span>
					</p>
				</div>
				<div class="hero-actions">
					<span class="terminal-prompt__symbol">$</span>
					<NuxtLink to="/article" class="cta-button" data-dom-id="cta-articles">
						开始阅读 <span class="cta-button__arrow">&rarr;</span>
					</NuxtLink>
					<span class="terminal-cursor" />
				</div>
			</div>
		</section>

		<!-- ═══════════════════════════════════════════════════
         FEATURED POSTS
         ═══════════════════════════════════════════════════ -->
		<section class="content-section">
			<h2 class="geek-h2 content-section__title">最新文章</h2>
			<div class="post-grid">
				<NuxtLink v-for="post in posts" :key="post.id" :to="post.path" class="post-card"
					:data-dom-id="`post-${post.id}`" :style="{
						borderColor: hoveredCard === post.id ? 'var(--geek-brand-500)' : 'var(--geek-border)',
						transform: hoveredCard === post.id ? 'translateY(-2px)' : 'translateY(0)'
					}" @mouseenter="hoveredCard = post.id" @mouseleave="hoveredCard = null">
					<h3 class="geek-h3 post-card__title">{{ post.title }}</h3>
					<p class="geek-body post-card__excerpt">{{ post.excerpt }}</p>
					<div class="post-card__meta">
						<span class="post-card__date">{{ post.date }}</span>
						<div class="post-card__tags">
							<span v-for="tag in post.tags" :key="tag" class="post-tag post-tag--brand">{{
								tag }}</span>
						</div>
					</div>
				</NuxtLink>
			</div>
		</section>

		<!-- ═══════════════════════════════════════════════════
         TECH STACK
         ═══════════════════════════════════════════════════ -->
		<section class="content-section">
			<h2 class="geek-h2 content-section__title">技术栈</h2>
			<div class="tech-stack-grid">
				<span v-for="tech in techStack" :key="tech" class="tech-stack-badge">{{ tech }}</span>
			</div>
		</section>

		<!-- ═══════════════════════════════════════════════════
         FOOTER CTA
         ═══════════════════════════════════════════════════ -->
		<section class="content-section cta-section">
			<div class="cta-panel">
				<div class="cta-panel__line">
					<span class="terminal-prompt__symbol">$</span>
					<span class="geek-body cta-panel__text">想和我交流？</span>
				</div>
				<div class="cta-panel__line">
					<span class="terminal-prompt__symbol">$</span>
					<span class="terminal-prompt__command">echo</span>
					<span class="cta-panel__value"><button class="cta-button" commandFor="contact-dialog"
							command="show-modal">查看联系方式</button></span>
					<span class="terminal-cursor" />
				</div>
			</div>
		</section>
	</main>

	<dialog id="contact-dialog" class="contact-dialog">
		<div class="contact-dialog__content">
			<div class="contact-dialog__header">
				<h3 class="geek-h3">联系我</h3>
				<form method="dialog" class="contact-dialog__close-form">
					<button type="submit" class="contact-dialog__close-button" aria-label="关闭联系窗口">×</button>
				</form>
			</div>
			<p class="geek-body">你可以通过以下方式联系我：</p>
			<ul class="geek-list">
				<li>Email: <a href="mailto:contact@waterspo.top">contact@waterspo.top</a></li>
				<li>QQ: <a href="https://wpa.qq.com/msgrd?v=3&uin=3811517931&site=qq&menu=yes">3811517931</a></li>
				<li>Telegram: <a href="https://t.me/mfjip612">@mfjip612</a></li>
			</ul>
		</div>
	</dialog>
</template>

<style scoped>
/* ── Page shell ──────────────────────────────────────── */
.page-home {
	max-width: 960px;
	margin: 0 auto;
	padding: 0 24px;
	min-height: calc(100vh - 64px - 120px);
}

/* ── HERO ────────────────────────────────────────────── */
.hero-banner {
	padding: var(--geek-space-3xl) 0;
}

.hero-panel {
	background: var(--geek-code-bg);
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-md);
	padding: var(--geek-space-xl);
}

.terminal-prompt {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: var(--geek-space-md);
}

.terminal-prompt__symbol {
	color: var(--geek-text-tertiary);
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-sm);
}

.terminal-prompt__command {
	color: var(--geek-brand-500);
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-sm);
}

.hero-content {
	margin-bottom: var(--geek-space-lg);
}

.hero-banner__ascii {
	margin: 0 0 var(--geek-space-sm) 0;
	padding: 0;
	color: var(--geek-brand-500);
	font-family: var(--geek-font-mono);
	font-size: clamp(8px, 1vw, 12px);
	line-height: 1.2;
	white-space: pre;
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

.hero-banner__lead {
	font-size: var(--geek-text-lg);
	max-width: 560px;
	margin: 0;
}

.hero-banner__lead-muted {
	color: var(--geek-text-tertiary);
}

.hero-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.terminal-cursor {
	display: inline-block;
	width: 8px;
	height: 16px;
	background: var(--geek-brand-500);
	animation: blink 1s step-end infinite;
}

@keyframes blink {
	0%, 50% { opacity: 1; }
	51%, 100% { opacity: 0; }
}

.cta-button {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 8px 16px;
	background: transparent;
	border: 1px solid var(--geek-brand-500);
	color: var(--geek-brand-500);
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-sm);
	text-decoration: none;
	border-radius: var(--geek-radius-sm);
	cursor: pointer;
	transition: all 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.cta-button:hover {
	background: var(--geek-brand-500);
	color: var(--geek-surface);
}

.cta-button__arrow {
	transition: transform 120ms ease;
}

.cta-button:hover .cta-button__arrow {
	transform: translateX(2px);
}

/* ── Content sections ────────────────────────────────── */
.content-section {
	padding: var(--geek-space-xl) 0;
}

.content-section__title {
	font-family: var(--geek-font-mono);
	margin-bottom: var(--geek-space-md);
}

.post-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
}

.post-card {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 20px;
	background: var(--geek-surface);
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-md);
	text-decoration: none;
	color: inherit;
	transition: all 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.post-card__title {
	margin: 0;
	font-size: var(--geek-text-lg);
}

.post-card__excerpt {
	margin: 0;
	color: var(--geek-text-secondary);
	font-size: var(--geek-text-sm);
	line-height: 1.5;
}

.post-card__meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: auto;
}

.post-card__date {
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-xs);
	color: var(--geek-text-tertiary);
}

.post-card__tags {
	display: flex;
	gap: 4px;
	flex-wrap: wrap;
}

.post-tag {
	padding: 2px 8px;
	border-radius: var(--geek-radius-sm);
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-xs);
	background: var(--geek-brand-50);
	color: var(--geek-brand-600);
}

.tech-stack-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.tech-stack-badge {
	padding: 6px 12px;
	background: var(--geek-surface);
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-sm);
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-sm);
	color: var(--geek-text-secondary);
}

/* ── CTA section ─────────────────────────────────────── */
.cta-section {
	padding-bottom: var(--geek-space-3xl);
}

.cta-panel {
	background: var(--geek-code-bg);
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-md);
	padding: var(--geek-space-lg);
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.cta-panel__line {
	display: flex;
	align-items: center;
	gap: 8px;
}

.cta-panel__text {
	color: var(--geek-text-primary);
}

.cta-panel__value {
	color: var(--geek-brand-500);
}

/* ── Contact dialog ──────────────────────────────────── */
.contact-dialog {
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-md);
	background: var(--geek-surface);
	color: var(--geek-text-primary);
	padding: 24px;
	max-width: 400px;
}

.contact-dialog__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.contact-dialog__close-button {
	background: none;
	border: none;
	font-size: 20px;
	color: var(--geek-text-tertiary);
	cursor: pointer;
}

.geek-list {
	list-style: none;
	padding: 0;
	margin: 12px 0 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.geek-list a {
	color: var(--geek-brand-500);
}
</style>