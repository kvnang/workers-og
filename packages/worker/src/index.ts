/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ImageResponse } from "../../workers-og/src";
import { corsHeaders } from "./cors";
export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const params = new URL(request.url).searchParams;
    const title = params.get("title") || "Lorem ipsum dolor sit amet";
    const format = params.get("format");
    const debug = params.get("debug");

    const html = `
 <div style="display: flex; flex-direction: column; height: 100vh; width: 100vw; font-family: sans-serif; background-image: linear-gradient(135deg, #281c4a, #160f29)">
    <div style="display: flex; width: 100vw; padding: 80px 80px 10px 80px; color: white;">
      <img src="data:image/svg+xml,%3Csvg width='256' height='256' viewBox='0 0 256 256' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M101.702 91.5053L145.181 39.8831C148.253 36.4719 152.008 33.7475 156.202 31.8874C160.395 30.0273 164.933 29.0732 169.518 29.0873H170.493V27H119.32V28.9976H121.47C127.642 28.9976 130.542 34.6087 126.779 39.625L66.624 114.533V43.1376C66.7321 39.4054 68.2919 35.8635 70.9703 33.2678C73.6488 30.6721 77.2338 29.2282 80.96 29.2444H83.7712V27H16V29.2444H18.8784C22.6014 29.2433 26.1775 30.7002 28.8433 33.3042C31.5092 35.9083 33.0537 39.4532 33.1472 43.1824V167.065C33.0739 170.813 31.5359 174.384 28.8637 177.009C26.1915 179.634 22.5982 181.104 18.856 181.104H16V183.348H27.0432L101.702 91.5053Z' fill='%23FFBC42'/%3E%3Cpath d='M239.742 218.9C212.213 217.497 191.806 203.189 166.562 169.937L109.71 99.2374L89.5504 123.814L118.032 158.794H60.8L56.4656 164.068H122.322L138.55 184.021C173.181 227.328 205.75 238.64 240 221.055L239.742 218.9Z' fill='%23FFD890'/%3E%3C/svg%3E" width="80" height="80">
    </div>
    <div style="display: flex; flex: 1; align-items: flex-end; width: 100vw; padding: 10px 80px 80px 80px; color: white;">
      <div style="display: flex; flex-direction: column;">
        <h1 style="font-size: 60px; font-weight: 600; margin: 0; font-family: 'Bitter'; font-weight: 500">${title}</h1>
        <div style="display: flex; align-items: center; margin-top: 20px;">
          <div style="display: flex; border-radius: 50%; width: 40px; height: 40px; overflow: hidden;">
            <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAgICAgJCAkKCgkNDgwODRMREBARExwUFhQWFBwrGx8bGx8bKyYuJSMlLiZENS8vNUROQj5CTl9VVV93cXecnNEBCAgICAkICQoKCQ0ODA4NExEQEBETHBQWFBYUHCsbHxsbHxsrJi4lIyUuJkQ1Ly81RE5CPkJOX1VVX3dxd5yc0f/CABEIACgAKAMBIgACEQEDEQH/xAAxAAADAQADAQAAAAAAAAAAAAAABgcFAQIEAwEBAQADAAAAAAAAAAAAAAAABQQAAgP/2gAMAwEAAhADEAAAAH/pqxMRLeq0396HOunBVCsSyrJILGIwK1RvxpPmWk4MnCVHyMwaU0oC4r//xAAtEAACAQIFAwIEBwAAAAAAAAABAgMABAUGERIhIjFBIzIHFFFhEBMkUnHBwv/aAAgBAQABPwB4FaTqT28D7isfzvY5btYbcoZ7xgSkXYKnhnNL8UMfaUS/JIIv2iIlay3mWzx613x9E6D1I/7H4InqCswfqM6YnJOCUhKQxDTX2oD/AKqyxDDUQI0wV9vKMnVp9QKwaaCDM2FSW4UC5Z4pNvAPFHtUSjcTrV1hxhxrEDexkfmytIrsAwdfqKs4oJAy/LkEyEiTQBdmm3b0ngVgtgExvD5YxuCSanUlgAAeQTz5pm6TzSgbiO1Z2lEEmGSeCJVJqC4wwQjZtLj2qB5rLoCYdHJtAkZmLGg+8a6VNNDbgvKdABWaMQS9voG3aEKUSHudnctVjsSPUAbv45rLeZ7WKeaxmZlnml3w7h6Z4ACbvBOlW15FKh6iDr2P2r//xAAfEQACAgIBBQAAAAAAAAAAAAABAgARAwQhEhNRYZH/2gAIAQIBAT8A0LVnbwIMzdS2KuGa5IupjvJkVb9/Ix5mvgx9hnrkkiaoAyMY6gGf/8QAHxEAAgICAgMBAAAAAAAAAAAAAQIAEQMEEiIQEzFh/9oACAEDAQE/AMw9hRf2PrqEYhrrxjPfjX0TZ4YsRbjd9YsxkhwZsgMlGFQpoT//2Q==" width="40" height="40">
          </div>
          <span style="margin-left: 20px; font-family: 'Bitter'; font-weight: 500; font-size: 24px;">Kevin Ang</span>
        </div>
      </div>
    </div>
 </div>
   `;

    return new ImageResponse(html, {
      format: format as "svg" | "png",
      debug: debug === "true",
      headers: {
        ...corsHeaders,
      },
    });
  },
};
