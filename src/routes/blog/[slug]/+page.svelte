<script>
  import { resolve } from '$app/paths';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { data } = $props();
  let article = $derived(data.article);
  let slug = $derived(data.slug);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simple markdown-like rendering helper
  const renderContent = (raw) => {
    let html = raw
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.every(c => c.trim().match(/^-+$/))) return '';
        return `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
      })
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(?!<[hbuol]|<pre|<code|<blockquote|<tr)(.+)$/gm, '<p>$1</p>');

    html = html.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, '<ul>$&</ul>');
    html = html.replace(/(<tr>[\s\S]*?<\/tr>(?:\s*<tr>[\s\S]*?<\/tr>)*)/g, '<table><tbody>$&</tbody></table>');

    return html;
  };

  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  let renderedContent = $derived(renderContent(article.content));

  let activeTocItem = $state('');

  function scrollToHeading(text) {
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
</script>

<svelte:head>
  <title>{article.title} // MFJip612</title>
  <meta name="description" content={article.summary || article.content.slice(0, 160)} />
</svelte:head>

<div class="page-wrapper">
  <!-- Navigation -->
  <Navbar activePath="/blog" />

  <!-- Main Content -->
  <main class="article-layout">
    <div class="article-container">
      <!-- ARTICLE CONTENT (8 cols) -->
      <article class="article-content" aria-label="Article content">
        <!-- Tags -->
        <div class="article-tags-top">
          {#each article.tags as tag (tag)}
            <span class="tag-chip">#{tag}</span>
          {/each}
        </div>

        <!-- Title -->
        <h1 class="article-heading">{article.title}</h1>

        <!-- Meta -->
        <div class="article-meta-row">
          <div class="meta-item">
            <span class="meta-icon material-symbols-outlined">person</span>
            <span>{article.author.name}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon material-symbols-outlined">calendar_today</span>
            <span>{formatDate(article.date)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon material-symbols-outlined">schedule</span>
            <span>{article.readTime} read</span>
          </div>
        </div>

        <!-- Hero Image -->
        {#if article.heroImage}
          <div class="hero-image-container">
            <img
              src={article.heroImage}
              alt={article.title}
              class="hero-image"
            />
          </div>
        {/if}

        <!-- Summary -->
        {#if article.summary}
          <div class="article-summary">
            <p>{article.summary}</p>
          </div>
        {/if}

        <!-- Article Body -->
        <div class="prose-wrapper">
          {@html renderedContent}
        </div>
      </article>

      <!-- SIDEBAR (4 cols) -->
      <aside class="article-sidebar">
        <div class="sidebar-sticky">
          <!-- About Author -->
          <section class="sidebar-card">
            <h4 class="sidebar-card-title">
              <span class="material-symbols-outlined sidebar-title-icon">account_circle</span>
              关于作者
            </h4>
            <div class="author-info">
              <div class="author-avatar">
                <span class="material-symbols-outlined avatar-icon">person</span>
              </div>
              <div>
                <p class="author-name">{article.author.name}</p>
                <p class="author-role">{article.author.role}</p>
              </div>
            </div>
            <p class="author-bio">{article.author.bio}</p>
          </section>

          <!-- Table of Contents -->
          {#if article.toc && article.toc.length > 0}
            <section class="sidebar-card">
              <h4 class="sidebar-card-title">目录导航</h4>
              <ul class="toc-list">
                {#each article.toc as item, i}
                  <li>
                    <button
                      class="toc-link"
                      class:active={activeTocItem === item}
                      onclick={() => scrollToHeading(item)}
                    >
                      {item}
                    </button>
                  </li>
                {/each}
              </ul>
            </section>
          {/if}

          <!-- Related Articles -->
          {#if article.related && article.related.length > 0}
            <section class="sidebar-card">
              <h4 class="sidebar-card-title">相关文章</h4>
              <div class="related-list">
                {#each article.related as rel, i}
                  {#if i > 0}<div class="related-divider"></div>{/if}
                  <a
                    href={resolve('/blog/[slug]', { slug: rel.slug })}
                    class="related-item"
                  >
                    <p class="related-title">{rel.title}</p>
                    <p class="related-date">{formatDate(rel.date)}</p>
                  </a>
                {/each}
              </div>
            </section>
          {/if}
        </div>
      </aside>
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

  /* === Two-Column Layout === */
  .article-layout {
    flex: 1;
    padding: 2rem 1.25rem 4rem;
  }

  .article-container {
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    .article-container {
      grid-template-columns: 8fr 4fr;
    }
    .article-layout {
      padding: 2rem 4rem 4rem;
    }
  }

  /* === Article Content === */
  .article-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .article-tags-top {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag-chip {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: var(--color-surface-container-highest);
    color: var(--color-secondary);
    border: 1px solid var(--color-outline-variant);
    font-family: var(--font-code);
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .article-heading {
    font-family: var(--font-headline);
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--color-on-surface);
  }

  .article-meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
    font-family: var(--font-headline);
    font-size: 0.875rem;
    color: var(--color-on-surface-variant);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .meta-icon {
    font-size: 18px;
    color: var(--color-outline);
  }

  /* Hero Image */
  .hero-image-container {
    width: 100%;
    height: 350px;
    overflow: hidden;
    border: 1px solid var(--color-outline-variant);
    position: relative;
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(40%);
    opacity: 0.7;
    transition: all 0.7s ease;
  }

  .hero-image-container:hover .hero-image {
    filter: grayscale(0%);
    opacity: 1;
  }

  /* Summary */
  .article-summary {
    padding-left: 1rem;
    border-left: 4px solid var(--color-primary);
    line-height: 1.7;
    color: var(--color-on-surface);
    font-size: 1.0625rem;
  }

  /* === Prose Styles === */
  .prose-wrapper {
    line-height: 1.75;
    color: var(--color-on-surface-variant);
    font-size: 1.0625rem;
  }

  .prose-wrapper :global(h2) {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-primary);
    margin: 2.5rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-outline-variant);
    letter-spacing: -0.01em;
  }

  .prose-wrapper :global(h3) {
    font-family: var(--font-headline);
    font-size: 1.1875rem;
    font-weight: 600;
    color: var(--color-on-surface);
    margin: 2rem 0 0.75rem;
    letter-spacing: -0.01em;
  }

  .prose-wrapper :global(p) {
    margin-bottom: 1.125rem;
    line-height: 1.75;
  }

  .prose-wrapper :global(strong) {
    color: var(--color-on-surface);
    font-weight: 600;
  }

  .prose-wrapper :global(em) {
    color: var(--color-primary-fixed-dim);
    font-style: italic;
  }

  .prose-wrapper :global(ul),
  .prose-wrapper :global(ol) {
    margin: 1rem 0 1.25rem 1.5rem;
  }

  .prose-wrapper :global(li) {
    margin-bottom: 0.375rem;
    line-height: 1.65;
  }

  .prose-wrapper :global(li)::marker {
    color: var(--color-secondary);
  }

  .prose-wrapper :global(blockquote) {
    margin: 1.5rem 0;
    padding: 1rem 1.25rem;
    border-left: 4px solid var(--color-secondary);
    background-color: var(--color-surface-container-low);
    font-family: var(--font-code);
    font-style: italic;
    color: var(--color-on-surface);
    line-height: 1.7;
  }

  .prose-wrapper :global(pre) {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid var(--color-outline-variant);
    padding: 1.25rem;
    overflow-x: auto;
    margin: 1.25rem 0;
    font-family: var(--font-code);
    font-size: 0.875rem;
    line-height: 1.65;
    color: var(--color-on-surface);
    position: relative;
  }

  .prose-wrapper :global(pre code) {
    font-family: var(--font-code);
    font-size: 0.875rem;
    line-height: 1.65;
    color: var(--color-on-surface);
    background: none;
    padding: 0;
    border: none;
  }

  .prose-wrapper :global(.inline-code) {
    font-family: var(--font-code);
    font-size: 0.85em;
    color: var(--color-secondary-container);
    background-color: var(--color-surface-container-lowest);
    padding: 0.15em 0.4em;
    border: 1px solid var(--color-outline-variant);
  }

  .prose-wrapper :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.9375rem;
  }

  .prose-wrapper :global(th),
  .prose-wrapper :global(td) {
    padding: 0.625rem 0.875rem;
    text-align: left;
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .prose-wrapper :global(th) {
    font-family: var(--font-headline);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-secondary);
    background-color: var(--color-surface-container-high);
  }

  .prose-wrapper :global(tr:hover td) {
    background-color: rgba(74, 142, 255, 0.04);
  }

  /* === Sidebar === */
  .article-sidebar {
    display: none;
  }

  @media (min-width: 1024px) {
    .article-sidebar {
      display: block;
    }
  }

  .sidebar-sticky {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    position: sticky;
    top: 5rem;
  }

  .sidebar-card {
    background-color: var(--color-surface-container);
    border: 1px solid var(--color-outline-variant);
    padding: 1.5rem;
  }

  .sidebar-card-title {
    font-family: var(--font-headline);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-outline-variant);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sidebar-title-icon {
    font-size: 18px;
  }

  /* Author */
  .author-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .author-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: var(--color-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-icon {
    font-size: 32px;
    color: var(--color-surface);
  }

  .author-name {
    font-family: var(--font-headline);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-on-surface);
    margin-bottom: 0.125rem;
  }

  .author-role {
    font-family: var(--font-headline);
    font-size: 0.8125rem;
    color: var(--color-secondary);
  }

  .author-bio {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-on-surface-variant);
  }

  /* TOC */
  .toc-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toc-link {
    font-family: var(--font-headline);
    font-size: 0.8125rem;
    color: var(--color-on-surface-variant);
    text-decoration: none;
    display: block;
    padding: 0.35rem 0.75rem;
    border-left: 2px solid transparent;
    transition: all 0.2s ease;
    text-align: left;
    background: none;
    border-top: none;
    border-right: none;
    border-bottom: none;
    cursor: pointer;
  }

  .toc-link:hover,
  .toc-link.active {
    color: var(--color-primary);
    border-left-color: var(--color-primary);
  }

  /* Related Articles */
  .related-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .related-divider {
    height: 1px;
    background-color: var(--color-outline-variant);
    width: 100%;
  }

  .related-item {
    display: block;
    padding: 0.75rem 0;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .related-item:first-child {
    padding-top: 0;
  }

  .related-item:last-child {
    padding-bottom: 0;
  }

  .related-title {
    font-size: 0.9375rem;
    color: var(--color-on-surface);
    margin-bottom: 0.25rem;
    transition: color 0.2s ease;
    line-height: 1.4;
  }

  .related-item:hover .related-title {
    color: var(--color-primary);
  }

  .related-date {
    font-family: var(--font-headline);
    font-size: 0.75rem;
    color: var(--color-outline);
  }

  /* === Mobile === */
  @media (max-width: 767px) {
    .article-layout {
      padding: 1.5rem 1rem 3rem;
    }

    .article-heading {
      font-size: 1.5rem;
    }

    .article-meta-row {
      font-size: 0.8125rem;
      gap: 1rem;
    }

    .hero-image-container {
      height: 240px;
    }
  }
</style>
