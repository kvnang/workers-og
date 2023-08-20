import satori, { init } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { parseHtml } from "./parseHtml";
import { loadGoogleFont } from "./font";
import type { ImageResponseOptions } from "./types";

// @ts-expect-error .wasm files are not typed
import yogaWasm from "../vendors/yoga.wasm";
// @ts-expect-error .wasm files are not typed
import resvgWasm from "../vendors/resvg.wasm";

const initResvgWasm = async () => {
  try {
    await initWasm(resvgWasm as WebAssembly.Module);
  } catch (err) {
    // console.error(err);
  }
};

const initYogaWasm = async () => {
  try {
    const yoga = await initYoga(yogaWasm);
    await init(yoga);
  } catch (err) {
    console.error(err);
  }
};

export const og = async ({
  element,
  options,
}: {
  element: string | React.ReactNode;
  options: ImageResponseOptions;
}) => {
  // Init wasms
  await Promise.allSettled([initResvgWasm(), initYogaWasm()]);

  const reactElement =
    typeof element === "string" ? await parseHtml(element) : element;

  // render the React element-like object into an SVG
  const svg = await satori(reactElement, {
    width: options.width || 1200,
    height: options.height || 630,
    fonts: !!options.fonts?.length
      ? options.fonts
      : [
          {
            name: "Bitter",
            data: await loadGoogleFont({ family: "Bitter", weight: 600 }),
            weight: 500,
            style: "normal",
          },
        ],
  });

  const requestedFormat = options.format || "png";

  if (requestedFormat === "svg") {
    return svg;
  }

  // convert the SVG into a PNG
  const opts = {
    // background: "rgba(238, 235, 230, .9)",
    fitTo: {
      mode: "width" as const,
      value: options.width || 1200,
    },
    font: {
      loadSystemFonts: false, // It will be faster to disable loading system fonts.
    },
  };
  const resvg = new Resvg(svg, opts);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return pngBuffer;
};

export class ImageResponse extends Response {
  constructor(
    element: string | React.ReactNode,
    options: ImageResponseOptions = {}
  ) {
    super();

    if (options.format === "svg") {
      return (async () => {
        const svg = await og({ element, options });
        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": options.debug
              ? "no-cache, no-store"
              : "public, immutable, no-transform, max-age=31536000",
            ...options.headers,
          },
          status: options.status || 200,
          statusText: options.statusText,
        });
      })() as unknown as ImageResponse;
    } else {
      const body = new ReadableStream({
        async start(controller) {
          const buffer = await og({
            element,
            options,
          });

          controller.enqueue(buffer);
          controller.close();
        },
      });

      return new Response(body, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": options.debug
            ? "no-cache, no-store"
            : "public, immutable, no-transform, max-age=31536000",
          ...options.headers,
        },
        status: options.status || 200,
        statusText: options.statusText,
      });
    }
  }
}
