This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Linting & Formatting

This project uses [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting. ESLint (`eslint.config.mjs`, `eslint`, `eslint-config-next`) has been removed.

```bash
bun run lint          # oxlint (type-aware, powered by oxlint-tsgolint)
bun run lint:fix      # oxlint --fix
bun run format        # oxfmt (write in place)
bun run format:check  # oxfmt --check (CI)
```

- `.oxlintrc.json` mirrors the former `eslint-config-next` rule set (`nextjs/*`, `react/*`, `react-hooks` incl. React Compiler rules, `jsx-a11y/*`, `import/*`, `typescript/*`) and additionally enables type-aware `typescript/*` rules via `options.typeAware`.
- `.oxfmtrc.json` keeps Prettier-compatible defaults (`printWidth: 80`, double quotes, semicolons) and ignores build output (`next-env.d.ts`, `.next/**`, `public/**`).
- Type-aware linting requires the `oxlint-tsgolint` dev dependency (installed by `bun install`); without it `oxlint` exits with an error.
- VS Code/Cursor users are prompted to install the [Oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) (`.vscode/extensions.json`), with format-on-save and `source.fixAll.oxc` enabled.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
