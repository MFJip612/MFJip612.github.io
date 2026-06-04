<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  const links = [
    {
      name: 'Cloudflare Blog',
      url: 'https://blog.cloudflare.com/',
      description: 'The official Cloudflare blog covering web infrastructure, security, and edge computing.',
      tags: ['Infrastructure', 'Edge'],
      status: 'online'
    },
    {
      name: 'Svelte Society',
      url: 'https://svelte.dev/blog',
      description: 'Community-driven resources and updates from the Svelte ecosystem.',
      tags: ['Framework', 'Frontend'],
      status: 'online'
    },
    {
      name: 'Rust Blog',
      url: 'https://blog.rust-lang.org/',
      description: 'Official Rust language blog with announcements, deep dives, and community highlights.',
      tags: ['Systems', 'Language'],
      status: 'online'
    },
    {
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com/',
      description: 'A treasure trove of CSS knowledge, techniques, and modern layout patterns.',
      tags: ['CSS', 'Design'],
      status: 'online'
    },
    {
      name: 'Smashing Magazine',
      url: 'https://www.smashingmagazine.com/',
      description: 'In-depth articles on web development, UX design, and engineering practices.',
      tags: ['Engineering', 'UX'],
      status: 'online'
    },
    {
      name: 'WebAssembly.org',
      url: 'https://webassembly.org/',
      description: 'The home of WebAssembly — bringing high-performance languages to the browser.',
      tags: ['WASM', 'Performance'],
      status: 'online'
    }
  ];
</script>

<svelte:head>
  <title>Links // MFJip612</title>
  <meta name="description" content="Curated collection of useful links and resources." />
</svelte:head>

<div class="page-wrapper">
  <!-- Navigation -->
  <Navbar activePath="/links" />

  <!-- Page Header -->
  <header class="page-header">
    <div class="container">
      <div class="section-header">
        <h1>Links</h1>
      </div>
      <p class="page-subtitle">Curated bookmarks &amp; external references.</p>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-chips">
          <button class="chip chip-active" aria-pressed="true">All</button>
          <button class="chip" aria-pressed="false">Infrastructure</button>
          <button class="chip" aria-pressed="false">Frontend</button>
          <button class="chip" aria-pressed="false">Design</button>
        </div>
        <div class="link-count">
          <span class="count-label">ENTRIES:</span>
          <span class="count-value">{links.length}</span>
        </div>
      </div>

      <!-- Links Grid -->
      <div class="links-grid">
        {#each links as link (link.name)}
          <a href={link.url} target="_blank" rel="noopener noreferrer" class="link-card card">
            <div class="link-card-header">
              <div class="link-status-indicator">
                <span class="status-led {link.status}"></span>
                <span class="status-text">{link.status.toUpperCase()}</span>
              </div>
              <span class="link-arrow">&rarr;</span>
            </div>
            <div class="card-body link-card-body">
              <h3 class="link-name">{link.name}</h3>
              <p class="link-description">{link.description}</p>
              <div class="link-tags">
                {#each link.tags as tag (tag)}
                  <span class="chip chip-sm">{tag}</span>
                {/each}
              </div>
              <div class="link-url-display">
                <span class="url-icon">&lt;/&gt;</span>
                <span class="url-text">{new URL(link.url).hostname}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </main>

  <!-- Footer -->
  <Footer />
</div>

<style>
  .page-wrapper {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* === Page Header === */
  .page-header {
    padding: 3rem 0 2rem;
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .page-subtitle {
    margin-top: 0.5rem;
    color: var(--color-on-surface-variant);
    font-family: var(--font-code);
    font-size: var(--text-label-md);
  }

  /* === Main Content === */
  .main-content {
    flex: 1;
    padding: 3rem 0 4rem;
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filter-chips {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .chip-active {
    background-color: rgba(74, 142, 255, 0.3);
    border-color: rgba(74, 142, 255, 0.5);
    color: var(--color-primary-fixed-dim);
  }

  .chip[role='button'],
  button.chip {
    cursor: pointer;
    transition: all var(--transition-fast);
    background: none;
    border: none;
    font-family: inherit;
    font-size: inherit;
  }

  .chip[role='button']:hover,
  button.chip:hover {
    background-color: rgba(74, 142, 255, 0.2);
    border-color: rgba(74, 142, 255, 0.4);
  }

  .link-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-headline);
  }

  .count-label {
    font-size: 0.6875rem;
    color: var(--color-outline);
    letter-spacing: 0.06em;
  }

  .count-value {
    font-size: var(--text-label-md);
    color: var(--color-secondary-container);
    font-weight: 600;
  }

  /* Links Grid */
  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 767px) {
    .links-grid {
      grid-template-columns: 1fr;
    }
  }

  .link-card {
    text-decoration: none;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
    display: block;
  }

  .link-card:hover {
    border-color: var(--color-primary-container);
    box-shadow: var(--glow-cyan);
  }

  .link-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 1rem;
    border-bottom: 1px solid var(--color-outline-variant);
    background-color: var(--color-surface-container-high);
    border-radius: var(--radius-default) var(--radius-default) 0 0;
  }

  .link-status-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .status-led {
    width: 7px;
    height: 7px;
    border-radius: var(--radius-full);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .status-led.online {
    background-color: #28c840;
    box-shadow: 0 0 6px rgba(40, 200, 64, 0.5);
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .status-text {
    font-family: var(--font-headline);
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    color: var(--color-outline);
  }

  .link-arrow {
    font-family: var(--font-headline);
    font-size: 1rem;
    color: var(--color-outline);
    transition: transform var(--transition-fast), color var(--transition-fast);
  }

  .link-card:hover .link-arrow {
    transform: translateX(3px);
    color: var(--color-secondary-container);
  }

  .link-card-body {
    padding: 1.25rem 1.25rem 1rem;
  }

  .link-name {
    font-family: var(--font-headline);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-on-surface);
    margin-bottom: 0.5rem;
    line-height: 1.35;
  }

  .link-description {
    font-size: 0.875rem;
    color: var(--color-on-surface-variant);
    line-height: 1.55;
    margin-bottom: 0.875rem;
  }

  .link-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-bottom: 0.875rem;
  }

  .chip-sm {
    font-size: 0.6875rem;
    padding: 0.15rem 0.5rem;
  }

  .link-url-display {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-outline-variant);
  }

  .url-icon {
    font-family: var(--font-code);
    font-size: 0.6875rem;
    color: var(--color-outline);
  }

  .url-text {
    font-family: var(--font-code);
    font-size: 0.75rem;
    color: var(--color-on-surface-variant);
    word-break: break-all;
  }

  @media (max-width: 767px) {
    .links-grid {
      grid-template-columns: 1fr;
    }
    .page-header { padding: 2rem 0 1.5rem; }
    .main-content { padding: 2rem 0 3rem; }
    .filter-bar { flex-direction: column; align-items: flex-start; }
  }
</style>
