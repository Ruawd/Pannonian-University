# Pannonian University

Static website for Pannonian University (`pu.edu.rs`), built for deployment on Cloudflare Workers Static Assets.

## Local Development

```bash
npm install
npm run dev
```

The local preview runs on `http://127.0.0.1:8787/`.

## Build

```bash
npm run build
```

Static files are generated into `public/`.

## Deploy

```bash
npm run deploy
```

Wrangler uses `wrangler.jsonc` and serves the `public/` directory as Cloudflare Workers static assets.
