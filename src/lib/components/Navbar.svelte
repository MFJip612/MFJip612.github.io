<script>
  let { activePath = '' } = $props();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/links', label: 'Links' }
  ];
</script>

<nav class="nav-bar">
  <div class="container nav-inner">
    <a href="/" class="nav-brand">
      <span class="brand-prefix">&gt;_</span>
      <span class="brand-name">MFJip612</span>
      {#if activePath === '/'}
        <span class="brand-cursor">_</span>
      {/if}
    </a>
    <div class="nav-links">
      {#each navItems as item (item.href)}
        <a
          href={item.href}
          class="nav-link"
          class:active={activePath === item.href}
          aria-current={activePath === item.href ? 'page' : undefined}
        >
          {item.label}
        </a>
      {/each}
    </div>
    <button class="nav-mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span class="toggle-bar"></span>
      <span class="toggle-bar"></span>
      <span class="toggle-bar"></span>
    </button>
  </div>
</nav>

<style>
  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-outline-variant);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
  }

  .nav-brand {
    display: flex;
    align-items: baseline;
    gap: 0;
    text-decoration: none;
    color: var(--color-on-surface);
    font-family: var(--font-headline);
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: -0.02em;
  }

  .brand-prefix {
    color: var(--color-secondary-container);
  }

  .brand-name {
    color: var(--color-primary);
  }

  .brand-cursor {
    color: var(--color-secondary-container);
    animation: cursor-blink 1s step-end infinite;
  }

  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    font-family: var(--font-headline);
    font-size: var(--text-label-md);
    font-weight: 500;
    color: var(--color-on-surface-variant);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.25rem 0;
    position: relative;
    transition: color var(--transition-fast);
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--color-primary-container);
    transition: width var(--transition-base);
  }

  .nav-link:hover,
  .nav-link.active {
    color: var(--color-primary);
  }

  .nav-link.active::after,
  .nav-link:hover::after {
    width: 100%;
  }

  .nav-mobile-toggle {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .toggle-bar {
    display: block;
    width: 20px;
    height: 2px;
    background-color: var(--color-on-surface-variant);
    border-radius: var(--radius-full);
  }

  @media (max-width: 767px) {
    .nav-links {
      display: none;
    }

    .nav-mobile-toggle {
      display: flex;
    }
  }
</style>
