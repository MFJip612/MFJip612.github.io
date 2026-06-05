<script>
	let { text = 'Built with Precision, Made with ♥' } = $props();
</script>

<footer class="site-footer">
	<div class="footer-inner container">
		<div class="footer-left">
			<span class="footer-brand">&gt;_ MFJip612</span>
			<span class="footer-sep">//</span>
			<span class="footer-text">{text}</span>
		</div>
		<div class="footer-right">
			<span class="footer-status">
				<span class="status-dot"></span>
				All systems operational
			</span>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid var(--color-outline-variant);
		padding: 1.5rem 0;
		background-color: var(--color-surface-container-lowest);
		margin-top: auto;
	}

	.footer-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-headline);
		font-size: 0.8125rem;
	}

	.footer-brand {
		color: var(--color-primary);
		font-weight: 600;
	}

	.footer-sep {
		color: var(--color-outline-variant);
	}

	.footer-text {
		color: var(--color-on-surface-variant);
	}

	.footer-right {
		font-family: var(--font-headline);
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: var(--radius-full);
		background-color: #28c840;
		box-shadow: 0 0 6px rgba(40, 200, 64, 0.5);
	}

	@media (max-width: 767px) {
		.footer-inner {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
