# Cloudflare Workers OG Image Generator

> Using Vercel's [Satori](https://github.com/vercel/satori) engine, many credits to [`@vercel/og`](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation) for the inspiration.

This package is designed to be used with Cloudflare Workers, with a simple API inspired by `@vercel/og`. While `satori` accepts React element as the input, `workers-og` allows you to write a simple HTML, which will here be parsed into React element.

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
        <h1 style="font-size: 60px; font-weight: 600; margin: 0; font-family: 'Bitter', font-weight: 500">${title}</h1>
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
