<script>
  import { resolve } from '$app/paths';
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
      month: 'long',
      day: 'numeric'
    });
  };
</script>

<svelte:head>
  <title>文章列表 // MFJip612</title>
  <meta name="description" content="All blog posts by MFJip612 — Engineering, systems, and code." />
</svelte:head>

<div class="page-wrapper">
  <!-- Navigation -->
  <Navbar activePath="/blog" />

  <!-- Page Header -->
  <header class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href={resolve('/')} class="breadcrumb-link">Home</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Blog</span>
      </nav>

      <h1 class="page-title">文章列表</h1>
      <p class="page-subtitle">Articles &amp; deep dives on engineering, systems, and code.</p>
    </div>
  </header>

  <!-- Article List -->
  <main class="main-content">
    <div class="container">
      <div class="article-list">
        {#each articles as article (article.slug)}
          <article class="article-card card">
            <a href={resolve('/blog/[slug]', { slug: article.slug })} class="article-link">
              <div class="article-meta">
                <time datetime={article.date} class="article-date">{formatDate(article.date)}</time>
                <span class="article-read-time">{article.readTime}</span>
              </div>
              <h2 class="article-title">{article.title}</h2>
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

  /* Page Header */
  .page-header {
    padding: 3rem 0 2.5rem;
    background: linear-gradient(
      180deg,
      var(--color-surface-container-lowest) 0%,
      transparent 100%
    );
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    font-family: var(--font-code);
    font-size: 0.8125rem;
  }

  .breadcrumb-link {
    color: var(--color-on-surface-variant);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .breadcrumb-link:hover {
    color: var(--color-primary);
  }

  .breadcrumb-sep {
    color: var(--color-outline);
  }

  .breadcrumb-current {
    color: var(--color-on-surface);
  }

  .page-title {
    font-family: var(--font-headline);
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-on-surface);
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: var(--text-body-md);
    color: var(--color-on-surface-variant);
    line-height: 1.6;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    padding: 3rem 0 4rem;
  }

  /* Article Cards */
  .article-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 720px;
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

  /* Mobile Responsive */
  @media (max-width: 767px) {
    .page-header {
      padding: 2rem 0 2rem;
    }

    .page-title {
      font-size: 1.5rem;
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
