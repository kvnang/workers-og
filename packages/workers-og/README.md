# Cloudflare Workers OG Image Generator

> Using Vercel's [Satori](https://github.com/vercel/satori) engine, and many credits to [`@vercel/og`](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation) for the inspiration.

An `og:image` (social card) generator that is fast, browser-less (no Puppeteer), and capable of running on the edge.

This package is designed to be used with Cloudflare Workers (but may be used elsewhere), with the simple API inspired by `@vercel/og`.

## Difference from `@vercel/og`

`@vercel/og` is designed to run on Vercel’s edge runtime, and `workers-og` on Cloudflare Workers.

Although Vercel’s edge runtime runs on Cloudflare Workers, the way WASM is bundled is different and causes an error when using `@vercel/og` on a Worker.

**Another unique feature**: while `satori` (used in both `@vercel/og` and `workers-og`) accepts React element as the input, `workers-og` adds a feature which allows you to write a simple HTML, which will here be parsed into React element-like object. The parsing is handled by `HTMLRewriter`, which is part of Cloudflare Worker’s runtime API.

## Getting started

Install the package on your Worker project:

```bash
npm i workers-og
```

Then, import it to your project. The API mimics `@vercel/og` closely.

```typescript
import { ImageResponse } from "workers-og";
```

## Example Usage on a Worker:

```typescript
import { ImageResponse } from "workers-og";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const params = new URLSearchParams(new URL(request.url).search);
    const title = params.get("title") || "Lorem ipsum";

    const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw; font-family: sans-serif; background: #160f29">
      <div style="display: flex; width: 100vw; padding: 40px; color: white;">
        <h1 style="font-size: 60px; font-weight: 600; margin: 0; font-family: 'Bitter'; font-weight: 500">${title}</h1>
      </div>
    </div>
   `;

    return new ImageResponse(html, {
      width: 1200,
      height: 630,
    });
  },
};
```
