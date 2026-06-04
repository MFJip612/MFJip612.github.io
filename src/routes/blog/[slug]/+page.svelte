<script>
  let { data } = $props();
  const article = data.article;
  const slug = data.slug;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simple markdown-like rendering helper
  const renderContent = (raw) => {
    // Headers
    let html = raw
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold & italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Blockquotes
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      // Tables
      .replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.every(c => c.trim().match(/^-+$/))) return '';
        const tag = 'td';
        return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
      })
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Paragraphs (lines that aren't already wrapped)
      .replace(/^(?!<[hbuol]|<pre|<code|<blockquote|<tr)(.+)$/gm, '<p>$1</p>');

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, '<ul>$&</ul>');
    // Wrap <tr> sequences in <table>
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
</script>

<svelte:head>
  <title>{article.title} // MFJip612</title>
  <meta name="description" content={article.content.slice(0, 160)} />
</svelte:head>

<div class="page-wrapper">
  <!-- Navigation -->
  <nav class="nav-bar">
    <div class="container nav-inner">
      <a href="/" class="nav-brand">
        <span class="brand-prefix">&gt;_</span>
        <span class="brand-name">MFJip612</span>
      </a>
      <div class="nav-links">
        <a href="/" class="nav-link">Home</a>
        <a href="/about" class="nav-link">About</a>
        <a href="/links" class="nav-link">Links</a>
      </div>
      <button class="nav-mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
      </button>
    </div>
  </nav>

  <!-- Article Header -->
  <header class="article-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Post</span>
      </nav>

      <h1 class="article-title">{article.title}</h1>

      <div class="article-meta-bar">
        <time datetime={article.date} class="meta-date">{formatDate(article.date)}</time>
        <span class="meta-sep">&middot;</span>
        <span class="meta-read-time">{article.readTime} read</span>
        <span class="meta-sep">&middot;</span>
        <div class="meta-tags">
          {#each article.tags as tag (tag)}
            <span class="chip">{tag}</span>
          {/each}
        </div>
      </div>
    </div>
  </header>

  <!-- Article Body -->
  <main class="article-main">
    <div class="container">
      <div class="grid-main">
        <article class="prose-wrapper" aria-label="Article content">
          {@html renderedContent}
        </article>

        <aside class="sidebar" aria-label="Table of contents">
          <div class="sidebar-widget card">
            <div class="card-header">// On This Page</div>
            <div class="card-body">
              <ul class="toc-list">
                <li><a href="#introduction" class="toc-link active">Introduction</a></li>
                <li><a href="#key-concepts" class="toc-link">Key Concepts</a></li>
                <li><a href="#implementation" class="toc-link">Implementation</a></li>
                <li><a href="#conclusion" class="toc-link">Conclusion</a></li>
              </ul>
            </div>
          </div>

          <div class="sidebar-widget card">
            <div class="card-header">// Actions</div>
            <div class="card-body action-body">
              <button class="btn-ghost btn-block" style="margin-bottom: 0.5rem;">Copy Link</button>
              <a href="/" class="btn-ghost btn-block" style="text-align: center; display: block;">&larr; Back to Posts</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>

  <!-- Article Footer -->
  <footer class="article-footer">
    <div class="container footer-inner">
      <div class="footer-left">
        <span class="footer-brand">&gt;_ MFJip612</span>
        <span class="footer-sep">//</span>
        <span class="footer-text">Built with precision.</span>
      </div>
      <div class="footer-right">
        <span class="footer-status">
          <span class="status-dot"></span>
          All systems operational
        </span>
      </div>
    </div>
  </footer>
</div>

<style>
  .page-wrapper {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* === Navigation (shared) === */
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
    text-decoration: none;
    color: var(--color-on-surface);
    font-family: var(--font-headline);
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: -0.02em;
  }

  .brand-prefix { color: var(--color-secondary-container); }
  .brand-name { color: var(--color-primary); }

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

  .nav-link:hover { color: var(--color-primary); }
  .nav-link:hover::after { width: 100%; }

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

  /* === Article Header === */
  .article-header {
    padding: 3rem 0 2.5rem;
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    font-family: var(--font-headline);
    font-size: 0.75rem;
  }

  .breadcrumb-link {
    color: var(--color-outline);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .breadcrumb-link:hover { color: var(--color-primary); }

  .breadcrumb-sep { color: var(--color-outline-variant); }
  .breadcrumb-current { color: var(--color-on-surface-variant); }

  .article-title {
    font-family: var(--font-headline);
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--color-on-surface);
    max-width: 800px;
    margin-bottom: 1.25rem;
  }

  .article-meta-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-family: var(--font-headline);
    font-size: 0.8125rem;
  }

  .meta-date {
    color: var(--color-secondary-container);
  }

  .meta-sep { color: var(--color-outline-variant); }

  .meta-read-time {
    color: var(--color-on-surface-variant);
  }

  .meta-tags {
    display: flex;
    gap: 0.375rem;
  }

  /* === Article Main === */
  .article-main {
    flex: 1;
    padding: 3rem 0 4rem;
  }

  /* Prose / Content Styles */
  .prose-wrapper {
    line-height: 1.75;
    color: var(--color-on-surface-variant);
    font-size: var(--text-body-md);
  }

  .prose-wrapper :global(h2) {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-on-surface);
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
    padding-left: 0;
  }

  .prose-wrapper :global(li) {
    margin-bottom: 0.375rem;
    line-height: 1.65;
    position: relative;
  }

  .prose-wrapper :global(li)::marker {
    color: var(--color-primary-container);
  }

  .prose-wrapper :global(blockquote) {
    margin: 1.5rem 0;
    padding: 0.875rem 1.25rem;
    border-left: 3px solid var(--color-primary-container);
    background-color: var(--color-surface-container-low);
    border-radius: 0 var(--radius-default) var(--radius-default) 0;
    font-style: italic;
    color: var(--color-on-surface);
  }

  .prose-wrapper :global(code:not(.inline-code)) {
    display: block;
    margin: 1.25rem 0;
  }

  .prose-wrapper :global(.inline-code) {
    font-family: var(--font-code);
    font-size: 0.85em;
    color: var(--color-secondary-container);
    background-color: var(--color-surface-container-lowest);
    padding: 0.15em 0.4em;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-outline-variant);
  }

  .prose-wrapper :global(pre) {
    background-color: var(--color-surface-container-lowest);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-default);
    padding: 1.25rem;
    overflow-x: auto;
    margin: 1.5rem 0;
    position: relative;
  }

  .prose-wrapper :global(pre code) {
    font-family: var(--font-code);
    font-size: var(--text-code-inline);
    line-height: 1.65;
    color: var(--color-secondary);
    background: none;
    padding: 0;
    border: none;
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

  /* Sidebar */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar-widget {
    overflow: hidden;
  }

  .toc-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .toc-link {
    font-family: var(--font-headline);
    font-size: 0.8125rem;
    color: var(--color-on-surface-variant);
    text-decoration: none;
    display: block;
    padding: 0.35rem 0;
    border-left: 2px solid transparent;
    padding-left: 0.75rem;
    transition: all var(--transition-fast);
  }

  .toc-link:hover,
  .toc-link.active {
    color: var(--color-primary);
    border-left-color: var(--color-primary-container);
  }

  .action-body {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .btn-block {
    width: 100%;
    text-align: center;
  }

  /* === Footer === */
  .site-footer,
  .article-footer {
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

  .footer-brand { color: var(--color-primary); font-weight: 600; }
  .footer-sep { color: var(--color-outline-variant); }
  .footer-text { color: var(--color-on-surface-variant); }

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
    .nav-links { display: none; }
    .nav-mobile-toggle { display: flex; }
    .article-header { padding: 2rem 0 1.5rem; }
    .article-main { padding: 2rem 0 3rem; }
    .article-meta-bar { font-size: 0.75rem; }
    .prose-wrapper :global(h2) { font-size: 1.25rem; }
    .prose-wrapper :global(h3) { font-size: 1.0625rem; }
    .footer-inner { flex-direction: column; text-align: center; }
  }
</style>
