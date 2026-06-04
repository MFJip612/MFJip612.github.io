<script>
  const skills = [
    { name: 'TypeScript / JavaScript', level: 95 },
    { name: 'Svelte / SvelteKit', level: 90 },
    { name: 'Rust', level: 75 },
    { name: 'Cloudflare Workers', level: 88 },
    { name: 'CSS / Design Systems', level: 92 },
    { name: 'Go', level: 65 }
  ];

  const timeline = [
    { year: '2024 — Now', title: 'Edge Infrastructure Engineer', desc: 'Building globally distributed systems on Cloudflare\'s edge network.' },
    { year: '2022 — 2024', title: 'Frontend Architect', desc: 'Led design system initiatives and frontend architecture at scale.' },
    { year: '2020 — 2022', title: 'Full-Stack Developer', desc: 'Full-cycle development from API design to pixel-perfect UI.' }
  ];
</script>

<svelte:head>
  <title>About // MFJip612</title>
  <meta name="description" content="About MFJip612 - Engineer, builder, tinkerer." />
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
        <a href="/about" class="nav-link active" aria-current="page">About</a>
        <a href="/links" class="nav-link">Links</a>
      </div>
      <button class="nav-mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
        <span class="toggle-bar"></span>
      </button>
    </div>
  </nav>

  <!-- Page Header -->
  <header class="page-header">
    <div class="container">
      <div class="section-header">
        <h1>About</h1>
      </div>
      <p class="page-subtitle">System profile &amp; capabilities overview.</p>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Bio Section -->
      <section class="bio-section">
        <div class="bio-grid">
          <div class="bio-avatar card">
            <div class="avatar-placeholder">
              <span class="avatar-initials">MF</span>
            </div>
          </div>
          <div class="bio-text card">
            <div class="card-body bio-body">
              <p class="bio-paragraph">
                I'm a software engineer who lives at the intersection of systems programming,
                web development, and design engineering. I care deeply about performance,
                developer experience, and building tools that respect the user's time.
              </p>
              <p class="bio-paragraph">
                Currently focused on edge computing, design systems at scale, and pushing
                what's possible in the browser. I believe in writing code that is fast,
                accessible, and a joy to work with.
              </p>
              <div class="bio-terminal code-block" style="margin-top: 1.25rem;">
                <span style="color: var(--color-secondary-container);">$</span> echo "Philosophy"
                <br />
                <span style="color: var(--color-on-surface);">  &rarr; Ship early. Iterate often. Never stop learning.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="skills-section" style="margin-top: 3rem;">
        <div class="section-header">
          <h2>Technical Proficiency</h2>
        </div>
        <div class="skills-grid card">
          <div class="card-body skills-body">
            {#each skills as skill (skill.name)}
              <div class="skill-row">
                <div class="skill-info">
                  <span class="skill-name">{skill.name}</span>
                  <span class="skill-percent">{skill.level}%</span>
                </div>
                <div class="skill-track">
                  <div
                    class="skill-fill"
                    style="width: {skill.level}%;"
                  ></div>
                  {#each Array(20) as _, i}
                    <div
                      class="skill-segment"
                      class:active={i / 20 * 100 <= skill.level}
                    ></div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Timeline Section -->
      <section class="timeline-section" style="margin-top: 3rem;">
        <div class="section-header">
          <h2>Timeline</h2>
        </div>
        <div class="timeline-list">
          {#each timeline as item (item.year)}
            <div class="timeline-item card">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <span class="timeline-year">{item.year}</span>
                <h3 class="timeline-title">{item.title}</h3>
                <p class="timeline-desc">{item.desc}</p>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Contact Section -->
      <section class="contact-section" style="margin-top: 3rem;">
        <div class="section-header">
          <h2>Connect</h2>
        </div>
        <div class="contact-grid">
          <a href="https://github.com/MFJip612" target="_blank" rel="noopener noreferrer" class="contact-card card">
            <div class="card-body contact-body">
              <span class="contact-icon">&lt;/&gt;</span>
              <span class="contact-label">GitHub</span>
              <span class="contact-handle">@MFJip612</span>
            </div>
          </a>
          <a href="/links" class="contact-card card">
            <div class="card-body contact-body">
              <span class="contact-icon">&#x26D3;</span>
              <span class="contact-label">Friend Links</span>
              <span class="contact-handle">View all &rarr;</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
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

  .nav-link:hover,
  .nav-link.active { color: var(--color-primary); }
  .nav-link.active::after,
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

  /* Bio Grid */
  .bio-grid {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 768px) {
    .bio-grid {
      grid-template-columns: 1fr;
      justify-items: center;
    }
  }

  .avatar-placeholder {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-surface-container-high) 0%, var(--color-surface-container-low) 100%);
    border-radius: var(--radius-default);
  }

  .avatar-initials {
    font-family: var(--font-headline);
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-primary);
    opacity: 0.8;
  }

  .bio-body {
    padding: 1.5rem;
  }

  .bio-paragraph {
    margin-bottom: 1rem;
    line-height: 1.7;
  }

  .bio-paragraph:last-of-type {
    margin-bottom: 0;
  }

  /* Skills */
  .skills-body {
    padding: 1.5rem;
  }

  .skill-row {
    margin-bottom: 1.25rem;
  }

  .skill-row:last-child {
    margin-bottom: 0;
  }

  .skill-info {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.375rem;
  }

  .skill-name {
    font-family: var(--font-headline);
    font-size: var(--text-label-md);
    font-weight: 500;
    color: var(--color-on-surface);
  }

  .skill-percent {
    font-family: var(--font-headline);
    font-size: 0.75rem;
    color: var(--color-outline);
  }

  .skill-track {
    display: flex;
    gap: 2px;
    height: 10px;
    position: relative;
  }

  .skill-segment {
    flex: 1;
    background-color: var(--color-outline-variant);
    border-radius: 1px;
    transition: background-color var(--transition-fast);
  }

  .skill-segment.active {
    background-color: var(--color-primary-container);
  }

  .skill-fill {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--color-primary-container), var(--color-secondary-container));
    opacity: 0.15;
    border-radius: 1px;
  }

  /* Timeline */
  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    padding-left: 1.5rem;
  }

  .timeline-list::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: var(--color-outline-variant);
  }

  .timeline-item {
    position: relative;
    padding: 1.25rem 1.5rem;
  }

  .timeline-marker {
    position: absolute;
    left: -1.5rem;
    top: 1.5rem;
    width: 14px;
    height: 14px;
    border-radius: var(--radius-full);
    background-color: var(--color-primary-container);
    border: 3px solid var(--color-background);
    box-shadow: 0 0 0 2px var(--color-primary-container);
  }

  .timeline-year {
    font-family: var(--font-headline);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-secondary-container);
    display: block;
    margin-bottom: 0.375rem;
  }

  .timeline-title {
    font-family: var(--font-headline);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-on-surface);
    margin-bottom: 0.375rem;
  }

  .timeline-desc {
    font-size: var(--text-body-md);
    color: var(--color-on-surface-variant);
    line-height: 1.6;
  }

  /* Contact Grid */
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .contact-card {
    text-decoration: none;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
  }

  .contact-card:hover {
    border-color: var(--color-primary-container);
    box-shadow: var(--glow-primary);
  }

  .contact-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1.5rem 1rem;
    text-align: center;
  }

  .contact-icon {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    color: var(--color-secondary-container);
  }

  .contact-label {
    font-family: var(--font-headline);
    font-size: var(--text-label-md);
    font-weight: 600;
    color: var(--color-on-surface);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .contact-handle {
    font-size: 0.8125rem;
    color: var(--color-on-surface-variant);
  }

  /* === Footer === */
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
    .page-header { padding: 2rem 0 1.5rem; }
    .main-content { padding: 2rem 0 3rem; }
    .footer-inner { flex-direction: column; text-align: center; }
  }
</style>
