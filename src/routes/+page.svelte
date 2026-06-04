<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  const articles = [
    {
      slug: 'building-cloudflare-workers',
      title: 'Building Scalable APIs with Cloudflare Workers',
      excerpt: 'A deep dive into serverless edge computing patterns using Cloudflare Workers and D1 database for globally distributed applications.',
      date: '2026-06-01',
      tags: ['Cloudflare', 'Serverless', 'Edge Computing'],
      readTime: '8 min'
    },
    {
      slug: 'sveltekit-reactive-system',
      title: 'Understanding Svelte 5 Reactivity: Runes Under the Hood',
      excerpt: 'Explore how Svelte 5 runes transform reactive programming with fine-grained reactivity and compile-time optimization.',
      date: '2026-05-25',
      tags: ['Svelte', 'Reactivity', 'Frontend'],
      readTime: '12 min'
    },
    {
      slug: 'rust-webassembly-performance',
      title: 'Rust + WebAssembly: Pushing Browser Performance Limits',
      excerpt: 'Practical guide to compiling Rust modules for WASM and integrating them into high-performance web applications.',
      date: '2026-05-18',
      tags: ['Rust', 'WebAssembly', 'Performance'],
      readTime: '10 min'
    },
    {
      slug: 'design-systems-engineering',
      title: 'Engineering Design Systems at Scale: Token-Driven Architecture',
      excerpt: 'How to build maintainable design systems using design tokens, CSS custom properties, and automated visual regression testing.',
      date: '2026-05-10',
      tags: ['Design Systems', 'CSS', 'Architecture'],
      readTime: '15 min'
    }
  ];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
</script>

<svelte:head>
  <title>MFJip612 // Terminal</title>
  <meta name="description" content="Personal blog - Engineering, systems, and code." />
</svelte:head>

<div class="page-wrapper">
  <!-- Navigation -->
  <Navbar activePath="/" />

  <!-- Hero Section -->
  <header class="hero-section">
    <div class="container">
      <div class="hero-content">
        <div class="hero-terminal">
          <div class="terminal-header">
            <span class="terminal-dot dot-red"></span>
            <span class="terminal-dot dot-yellow"></span>
            <span class="terminal-dot dot-green"></span>
            <span class="terminal-title">mfjip612@terminal ~ zsh</span>
          </div>
          <div class="terminal-body">
            <p class="terminal-line"><span class="prompt">$</span> whoami</p>
            <p class="terminal-output">MFJip612 — Engineer / Builder / Tinkerer</p>
            <p class="terminal-line"><span class="prompt">$</span> cat interests.txt</p>
            <p class="terminal-output">Systems &middot; Code &middot; Design &middot; Open Source</p>
            <p class="terminal-line"><span class="prompt">$</span> echo $FOCUS</p>
            <p class="terminal-output output-highlight">Building things that live on the edge.</p>
            <p class="terminal-line input-line"><span class="prompt">$</span> <span class="cursor-blink">_</span></p>
          </div>
        </div>
        <div class="hero-meta">
          <div class="status-block card">
            <div class="card-header">System Status</div>
            <div class="card-body status-body">
              <div class="status-row">
                <span class="status-label">Location</span>
                <span class="status-value">Edge Network</span>
              </div>
              <div class="status-row">
                <span class="status-label">Focus</span>
                <span class="status-value text-cyan">Active</span>
              </div>
              <div class="status-row">
                <span class="status-label">Uptime</span>
                <span class="status-value">{new Date().getFullYear() - 2000}+ years</span>
              </div>
              <div class="progress-bar" style="margin-top: 0.75rem;">
                {#each Array(12) as _, i}
                  <div class="progress-segment" class:inactive={i > 9}></div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <div class="grid-main">
        <!-- Article List -->
        <section class="articles-section" aria-label="Recent articles">
          <div class="section-header">
            <h2>Recent Posts</h2>
          </div>
          <div class="article-list">
            {#each articles as article (article.slug)}
              <article class="article-card card">
                <a href="/blog/{article.slug}" class="article-link">
                  <div class="article-meta">
                    <time datetime={article.date} class="article-date">{formatDate(article.date)}</time>
                    <span class="article-read-time">{article.readTime}</span>
                  </div>
                  <h3 class="article-title">{article.title}</h3>
                  <p class="article-excerpt">{article.excerpt}</p>
                  <div class="article-tags">
                    {#each article.tags as tag (tag)}
                      <span class="chip">{tag}</span>
                    {/each}
                  </div>
                </a>
              </article>
            {/each}
          </div>
        </section>

        <!-- Sidebar -->
        <aside class="sidebar" aria-label="Sidebar">
          <!-- About Widget -->
          <div class="sidebar-widget card">
            <div class="card-header">// About</div>
            <div class="card-body">
              <p class="widget-text">
                Software engineer focused on building fast, reliable systems.
                Writing about web development, distributed systems, and design engineering.
              </p>
              <a href="/about" class="btn-ghost btn-sm" style="margin-top: 0.75rem; display: inline-flex;">Read More &rarr;</a>
            </div>
          </div>

          <!-- Tags Widget -->
          <div class="sidebar-widget card">
            <div class="card-header">// Tags</div>
            <div class="card-body tag-cloud">
              <span class="chip">Cloudflare</span>
              <span class="chip">Svelte</span>
              <span class="chip">Rust</span>
              <span class="chip">TypeScript</span>
              <span class="chip">Design Systems</span>
              <span class="chip">WebAssembly</span>
              <span class="chip">Performance</span>
              <span class="chip">CSS</span>
            </div>
          </div>

          <!-- Links Widget -->
          <div class="sidebar-widget card">
            <div class="card-header">// Links</div>
            <div class="card-body">
              <ul class="link-list">
                <li><a href="https://github.com/MFJip612" target="_blank" rel="noopener noreferrer" class="sidebar-link">GitHub</a></li>
                <li><a href="/links" class="sidebar-link">Friend Links</a></li>
              </ul>
            </div>
          </div>
        </aside>
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

  /* === Hero Section === */
  .hero-section {
    padding: 3rem 0 4rem;
    background: linear-gradient(
      180deg,
      var(--color-surface-container-lowest) 0%,
      transparent 100%
    );
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (min-width: 1024px) {
    .hero-content {
      grid-template-columns: 1fr 300px;
    }
  }

  /* Terminal Window */
  .hero-terminal {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow:
      0 0 0 1px var(--color-outline-variant),
      0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .terminal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.75rem 1rem;
    background-color: var(--color-surface-container-high);
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .terminal-dot {
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
  }

  .dot-red { background-color: #ff5f57; }
  .dot-yellow { background-color: #febc2e; }
  .dot-green { background-color: #28c840; }

  .terminal-title {
    font-family: var(--font-code);
    font-size: 0.75rem;
    color: var(--color-on-surface-variant);
    margin-left: auto;
  }

  .terminal-body {
    padding: 1.25rem 1.5rem;
    font-family: var(--font-code);
    font-size: 0.875rem;
    line-height: 1.7;
    min-height: 220px;
  }

  .terminal-line {
    color: var(--color-on-surface-variant);
    margin-bottom: 0.25rem;
  }

  .prompt {
    color: var(--color-secondary-container);
    margin-right: 0.5em;
    font-weight: 600;
  }

  .terminal-output {
    color: var(--color-on-surface);
    margin-bottom: 0.5rem;
    padding-left: 1.25em;
  }

  .output-highlight {
    color: var(--color-primary);
  }

  .input-line {
    display: flex;
    align-items: center;
  }

  .cursor-blink {
    animation: cursor-blink 1s step-end infinite;
    color: var(--color-secondary-container);
    font-weight: 600;
  }

  /* Status Block */
  .status-body {
    padding: 0.875rem 1rem;
  }

  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.35rem 0;
  }

  .status-label {
    font-family: var(--font-headline);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-on-surface-variant);
  }

  .status-value {
    font-family: var(--font-headline);
    font-size: 0.8125rem;
    color: var(--color-on-surface);
    font-weight: 500;
  }

  .text-cyan {
    color: var(--color-secondary-container);
  }

  /* === Main Content === */
  .main-content {
    flex: 1;
    padding: 3rem 0 4rem;
  }

  /* Article Cards */
  .article-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .article-card {
    padding: 1.25rem 1.5rem;
  }

  .article-link {
    text-decoration: none;
    display: block;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.625rem;
  }

  .article-date {
    font-family: var(--font-headline);
    font-size: 0.75rem;
    color: var(--color-on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .article-read-time {
    font-family: var(--font-headline);
    font-size: 0.6875rem;
    color: var(--color-outline);
    letter-spacing: 0.04em;
  }

  .article-title {
    font-family: var(--font-headline);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-on-surface);
    margin-bottom: 0.5rem;
    line-height: 1.35;
    transition: color var(--transition-fast);
  }

  .article-link:hover .article-title {
    color: var(--color-primary);
  }

  .article-excerpt {
    font-size: var(--text-body-md);
    color: var(--color-on-surface-variant);
    line-height: 1.6;
    margin-bottom: 0.875rem;
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  /* Sidebar */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-widget {
    overflow: hidden;
  }

  .widget-text {
    font-size: 0.875rem;
    line-height: 1.65;
    color: var(--color-on-surface-variant);
  }

  .btn-sm {
    font-size: 0.75rem;
    padding: 0.4rem 0.875rem;
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .link-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sidebar-link {
    font-family: var(--font-headline);
    font-size: var(--text-label-md);
    color: var(--color-primary);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    transition: all var(--transition-fast);
    padding: 0.25rem 0;
  }

  .sidebar-link::before {
    content: '&gt;';
    color: var(--color-outline);
    transition: color var(--transition-fast);
  }

  .sidebar-link:hover {
    color: var(--color-secondary-container);
    padding-left: 0.25rem;
  }

  .sidebar-link:hover::before {
    color: var(--color-secondary-container);
  }

  /* Mobile Responsive */
  @media (max-width: 767px) {
    .hero-section {
      padding: 2rem 0 2.5rem;
    }

    .terminal-body {
      padding: 1rem;
      font-size: 0.8125rem;
      min-height: 180px;
    }

    .main-content {
      padding: 2rem 0 3rem;
    }

    .article-card {
      padding: 1rem;
    }

    .article-title {
      font-size: 1rem;
    }
  }
</style>
