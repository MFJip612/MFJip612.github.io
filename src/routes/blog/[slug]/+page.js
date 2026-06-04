const articles = {
  'building-cloudflare-workers': {
    title: 'Building Scalable APIs with Cloudflare Workers',
    date: '2026-06-01',
    readTime: '8 min',
    tags: ['Cloudflare', 'Serverless', 'Edge Computing'],
    content: `
## Introduction

Cloudflare Workers represent a paradigm shift in how we think about server-side computation. Instead of traditional server-based architectures, Workers run your code at the edge — in data centers distributed across more than 300 cities worldwide.

## Why Edge Computing Matters

The fundamental advantage of edge computing is **latency reduction**. When your code runs closer to your users, every network round-trip becomes faster.

\`\`\`typescript
// A simple Cloudflare Worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok', region: env.CF_REGION });
    }

    return new Response('Not Found', { status: 404 });
  }
};
\`\`\`

### Key Benefits

1. **Global distribution** — Code runs in 300+ locations
2. **Cold start times** &lt; 5ms (V8 isolates, not containers)
3. **Free tier** — 100,000 requests/day
4. **Native integrations** — KV, D1, R2, Queues

## D1: SQLite at the Edge

D1 brings a familiar SQL database to the Workers platform. It's built on SQLite and offers:

- **Read replication** to every edge location
- **Transactional consistency** via a single writer
- **Familiar syntax** — it's just SQLite

\`\`\`sql
-- Schema definition for a blog posts table
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
\`\`\`

## Performance Considerations

When building APIs on Workers, keep these patterns in mind:

| Pattern | Description | Impact |
|---------|-------------|--------|
| Cache-first | Check cache before origin | High |
| Streaming | Stream responses incrementally | Medium |
| Smart routing | Route requests to nearest DB replica | High |

## Conclusion

Cloudflare Workers offer a compelling platform for building globally-distributed applications. The combination of low latency, generous free tier, and native data store integrations makes them an excellent choice for modern web APIs.

> "The edge isn't the future of computing — it's the present."
    `
  },
  'sveltekit-reactive-system': {
    title: 'Understanding Svelte 5 Reactivity: Runes Under the Hood',
    date: '2026-05-25',
    readTime: '12 min',
    tags: ['Svelte', 'Reactivity', 'Frontend'],
    content: `
## The Runes Revolution

Svelte 5 introduces **runes** — a fundamentally new approach to reactivity that moves away from compile-time assignment detection toward explicit reactive declarations.

### \`$state\`: Reactive State

The most important rune. It marks a variable as reactive:

\`\`\`svelte
<script>
  let count = $state(0);
  let items = $state([]);

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>
\`\`\`

### \`$derived\`: Computed Values

Derived values automatically track their dependencies and recalculate when those dependencies change:

\`\`\`svelte
<script>
  let firstName = $state('');
  let lastName = $state('');

  let fullName = $derived((firstName + ' ' + lastName).trim());
  let isValid = $derived(firstName.length > 0 && lastName.length > 0);
</script>
\`\`\`

### \`$effect\`: Side Effects

Effects run after the DOM has been updated:

\`\`\`svelte
<script>
  let theme = $state('dark');

  $effect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
</script>
\`\`\`

## Why Runes Matter

Runes solve several problems that existed with Svelte 3's compiler-based reactivity:

1. **Explicitness** — You can see what's reactive by looking at the code
2. **Fine-grained updates** — Only the parts of the DOM that depend on changed state update
3. **Better TypeScript support** — Runes work naturally with the type system
4. **Reusable logic** — Effects and derived values can be extracted into functions

## Migration Path

Migrating from Svelte 3/4 to Svelte 5 involves replacing \`let\` with \`$state()\`, computed properties with \`$derived()\`, and reactive statements with \`$effect()\`.
    `
  },
  'rust-webassembly-performance': {
    title: 'Rust + WebAssembly: Pushing Browser Performance Limits',
    date: '2026-05-18',
    readTime: '10 min',
    tags: ['Rust', 'WebAssembly', 'Performance'],
    content: `
## Why Rust for WASM?

Rust's combination of zero-cost abstractions, memory safety without garbage collection, and excellent tooling makes it arguably the best language for compiling to WebAssembly.

## Getting Started

\`\`\`rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0u64;
            let mut b = 1u64;
            for _ in 2..=n as u64 {
                let temp = a + b;
                a = b;
                b = temp;
            }
            b
        }
    }
}

#[wasm_bindgen]
pub fn process_array(data: Vec<i32>) -> Vec<i32> {
    data.into_iter()
        .map(|x| x * x)
        .filter(|&x| x > 100)
        .collect()
}
\`\`\`

## Performance Benchmarks

In our tests comparing JavaScript vs Rust/WASM implementations:

| Operation | JS (ms) | Rust/WASM (ms) | Speedup |
|-----------|---------|-----------------|---------|
| Array sort (10K items) | 12.4 | 3.1 | 4x |
| Image processing | 890 | 145 | 6x |
| JSON parsing | 34 | 18 | 1.9x |
| Crypto hashing | 156 | 23 | 6.8x |

## Best Practices

1. **Minimize JS-WASM boundary crossings** — Each call has overhead
2. **Use linear memory wisely** — Pre-allocate buffers when possible
3. **Leverage SIMD instructions** — Enable via RUSTFLAGS
4. **Profile with Chrome DevTools** — Use the Performance panel extensively
    `
  },
  'design-systems-engineering': {
    title: 'Engineering Design Systems at Scale: Token-Driven Architecture',
    date: '2026-05-10',
    readTime: '15 min',
    tags: ['Design Systems', 'CSS', 'Architecture'],
    content: `
## The Token Philosophy

A design token is the smallest unit of a design system — a named entity that stores visual design attributes. Tokens form the bridge between design tools and implementation.

## Token Taxonomy

\`\`\`
Global Tokens (Primitive)
├── color.blue.500 → #4a8eff
├── space.4 → 4px
├── radius.default → 0.25rem
└── font.mono → 'JetBrains Mono'

Alias Tokens (Semantic)
├── color.primary → {color.blue.500}
├── color.surface → #0b1326
├── color.on-surface → #dae2fd
└── spacing.gutter → calc({space.4} * 6)

Component Tokens (Specific)
├── button.primary.bg → {color.primary}
├── button.primary.text → {color.on-primary}
├── card.border → 1px solid {color.outline-variant}
└── input.focus.glow → 0 0 12px rgba(...)
\`\`\`

## Implementation with CSS Custom Properties

\`\`\`css
:root {
  /* Primitive */
  --color-blue-500: #4a8eff;

  /* Semantic */
  --color-primary: var(--color-blue-500);
  --color-surface: #0b1326;
  --color-on-surface: #dae2fd;

  /* Component */
  --btn-primary-bg: var(--color-primary);
  --btn-primary-text: var(--color-on-primary-container);
}

.btn-primary {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-radius: var(--radius-default);
  /* ... */
}
\`\`\`

## Scaling Strategies

For large organizations, consider these approaches:

1. **Single source of truth** — Store tokens in JSON/YAML, generate outputs
2. **Tool-agnostic format** — Use W3C Design Tokens Community Group format
3. **Automated testing** — Visual regression on token changes
4. **Versioned releases** — Treat tokens like any other API dependency
    `
  }
};

export function load({ params }) {
  const article = articles[params.slug];

  if (!article) {
    return {
      status: 404,
      error: new Error('Article not found')
    };
  }

  return {
    props: {
      article,
      slug: params.slug
    }
  };
}
