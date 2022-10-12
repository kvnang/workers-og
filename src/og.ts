// @ts-expect-error satori/wasm is not typed
import satori, { init } from "satori/wasm";
// @ts-expect-error yoga-wasm-web is not typed
import initYoga from "yoga-wasm-web";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { parseHtml } from "./parseHtml";
import { loadGoogleFont } from "./font";
import type { ImageResponseOptions, ReactElementLike } from "./types";

// @ts-expect-error .wasm files are not typed
import yogaWasm from "../vendors/yoga.wasm";
// @ts-expect-error .wasm files are not typed
import resvgWasm from "../vendors/index_bg.wasm";

export const og = async ({
  element,
  options,
}: {
  element: string | ReactElementLike;
  options: ImageResponseOptions;
}) => {
  // Init resvg wasm
  try {
    await initWasm(resvgWasm as WebAssembly.Module);
  } catch (err) {
    // console.error(err);
  }

  // Init yoga wasm
  try {
    const yoga = await initYoga(yogaWasm);
    await init(yoga);
  } catch (err) {
    console.error(err);
  }

  const reactElement =
    typeof element === "string" ? parseHtml(element) : element;

  // render the React element-like object into an SVG
  const svg = await satori(reactElement, {
    width: options.width || 1200,
    height: options.height || 600,
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
    element: string | ReactElementLike,
    options: ImageResponseOptions = {}
  ) {
    super();

    const body = new ReadableStream({
      async start(controller) {
        const pngBuffer = await og({
          element,
          options,
        });

        controller.enqueue(pngBuffer);
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
