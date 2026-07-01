<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import type { ArticleMeta } from '@/types'

const router = useRouter()

interface Post {
	id: string
	title: string
	excerpt: string
	date: string
	tags: string[]
	path: string
}

// 从路由自动获取最新文章（取前 3 篇）
const posts = computed<Post[]>(() => {
	return router.getRoutes()
		.filter((r) => r.meta?.date && r.path.startsWith('/article/'))
		.map((r) => {
			const meta = r.meta as unknown as ArticleMeta
			return {
				id: (r.meta?.articleId as string) ?? '',
				title: meta.title,
				excerpt: meta.description ?? '',
				date: meta.date,
				tags: meta.tags ?? [],
				path: r.path,
			}
		})
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
	<LayoutHeader />

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
					<RouterLink to="/article" class="cta-button" data-dom-id="cta-articles">
						开始阅读 <span class="cta-button__arrow">&rarr;</span>
					</RouterLink>
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
				<RouterLink v-for="post in posts" :key="post.id" :to="post.path" class="post-card"
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
				</RouterLink>
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

	<LayoutFooter />
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
	/* overflow-x: auto; */
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
	gap: 12px;
	flex-wrap: wrap;
}

.cta-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-sm);
	font-weight: var(--geek-weight-medium);
	color: var(--geek-brand-500);
	background: var(--geek-brand-100);
	border: 1px solid var(--geek-brand-400);
	border-radius: var(--geek-radius-sm);
	padding: 10px 20px;
	text-decoration: none;
	transition:
		background 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
		border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.cta-button:hover {
	background: var(--geek-brand-200);
	border-color: var(--geek-brand-500);
}

.cta-button__arrow {
	margin-left: 4px;
}

.terminal-cursor {
	display: inline-block;
	width: 8px;
	height: 16px;
	background: var(--geek-brand-500);
	animation: geek-blink 1s step-end infinite;
}

/* ── Section ─────────────────────────────────────────── */
.content-section {
	padding: var(--geek-space-2xl) 0;
}

.content-section__title {
	margin: 0 0 var(--geek-space-lg) 0;
	text-wrap: balance;
	word-break: keep-all;
}

/* ── Card grid ──────────────────────────────────────── */
.post-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 24px;
}

@media (min-width: 768px) {
	.post-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (min-width: 1024px) {
	.post-grid {
		grid-template-columns: repeat(3, 1fr);
	}
}

.post-card {
	display: flex;
	flex-direction: column;
	background: var(--geek-surface);
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-md);
	padding: var(--geek-space-lg);
	text-decoration: none;
	min-height: 200px;
	transition:
		border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
		transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.post-card:focus-visible {
	outline: 2px solid var(--geek-brand-500);
	outline-offset: 2px;
}

.post-card__title {
	margin: 0 0 var(--geek-space-sm) 0;
	text-wrap: balance;
	word-break: keep-all;
}

.post-card__excerpt {
	font-size: var(--geek-text-sm);
	line-height: 1.6;
	color: var(--geek-text-secondary);
	margin: 0 0 var(--geek-space-md) 0;
	flex: 1;
	display: -webkit-box;
	line-clamp: 3;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.post-card__meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	flex-wrap: wrap;
}

.post-card__date {
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-xs);
	color: var(--geek-text-tertiary);
}

.post-card__tags {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.post-tag {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-xs);
	border-radius: var(--geek-radius-sm);
	padding: 2px 8px;
}

.post-tag--brand {
	color: var(--geek-brand-500);
	background: var(--geek-brand-100);
}

/* ── Tech stack ─────────────────────────────────────── */
.tech-stack-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.tech-stack-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-sm);
	color: var(--geek-brand-500);
	background: var(--geek-code-bg);
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-sm);
	padding: 6px 14px;
}

/* ── Footer CTA ─────────────────────────────────────── */
.cta-section {
	padding-top: var(--geek-space-2xl);
	padding-bottom: var(--geek-space-xl);
}

.cta-panel {
	background: var(--geek-code-bg);
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-md);
	padding: var(--geek-space-xl);
}

.cta-panel__line {
	display: flex;
	align-items: center;
	gap: 8px;
}

.cta-panel__line + .cta-panel__line {
	margin-top: var(--geek-space-sm);
}

.cta-panel__text {
	font-size: var(--geek-text-base);
	color: var(--geek-text-primary);
}

.cta-panel__value {
	color: var(--geek-text-secondary);
	font-family: var(--geek-font-mono);
	font-size: var(--geek-text-sm);
}

.contact-dialog {
	border: 1px solid var(--geek-border);
	border-radius: var(--geek-radius-md);
	background: var(--geek-code-bg);
	color: var(--geek-text-primary);
	box-shadow: var(--geek-shadow-lg);
	width: 90%;
	max-width: 400px;
	padding: 0;
}

.contact-dialog::backdrop {
	background: color-mix(in srgb, var(--geek-text-primary) 38%, transparent);
}

.contact-dialog[open] {
	animation: geek-dialog-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.contact-dialog[open]::backdrop {
	animation: geek-dialog-backdrop-in 180ms ease-out;
}

.contact-dialog__content {
	padding: var(--geek-space-lg);
}

.contact-dialog__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: var(--geek-space-sm);
}

.contact-dialog__header h3 {
	margin: 0;
}

.contact-dialog__close-form {
	margin: 0;
}

.contact-dialog__close-button {
	width: 28px;
	height: 28px;
	border-radius: var(--geek-radius-sm);
	border: 1px solid var(--geek-border);
	background: transparent;
	color: var(--geek-text-tertiary);
	font-family: var(--geek-font-mono);
	font-size: 18px;
	line-height: 1;
	cursor: pointer;
	transition:
		color 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
		border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
		background 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.contact-dialog__close-button:hover {
	color: var(--geek-brand-500);
	border-color: var(--geek-brand-500);
	background: var(--geek-brand-100);
}

.contact-dialog__close-button:focus-visible {
	outline: 2px solid var(--geek-brand-500);
	outline-offset: 2px;
}

.contact-dialog :deep(a) {
	color: var(--geek-brand-500);
	text-decoration: none;
}

.contact-dialog :deep(a:hover) {
	text-decoration: underline;
}

@keyframes geek-blink {

	0%,
	50% {
		opacity: 1;
	}

	51%,
	100% {
		opacity: 0;
	}
}

@keyframes geek-dialog-in {
	from {
		opacity: 0;
		transform: translateY(6px) scale(0.98);
	}

	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

@keyframes geek-dialog-backdrop-in {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@media (prefers-reduced-motion: reduce) {

	.terminal-cursor {
		animation: none;
		opacity: 1;
	}

	.contact-dialog[open],
	.contact-dialog[open]::backdrop {
		animation: none;
	}
}
</style>
