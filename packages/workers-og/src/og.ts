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
    console.error(err);
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

interface Props {
  /**
   * The React element or HTML string to render into an image.
   * @example
   * ```tsx
   * <div
   *  style={{
   *    display: 'flex',
   *  }}
   * >
   *  <h1>Hello World</h1>
   * </div>
   * ```
   * @example
   * ```html
   * <div style="display:flex;"><h1>Hello World</h1></div>
   * ```
   */
  element: string | React.ReactNode;
  /**
   * The options for the image response.
   */
  options?: ImageResponseOptions | undefined;
}

export const og = async ({ element, options }: Props) => {
  // 1. Init WASMs
  await Promise.allSettled([initResvgWasm(), initYogaWasm()]);

  // 2. Get React Element
  const reactElement =
    typeof element === "string" ? await parseHtml(element) : element;

  // 3. Convert React Element to SVG with Satori
  const width = options?.width || 1200;
  const height = options?.height || 630;

  const svg = await satori(reactElement, {
    width,
    height,
    fonts: !!options?.fonts?.length
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

  const format = options?.format || "png";

  if (format === "svg") {
    return svg;
  }

  // 4. Convert the SVG into a PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width" as const,
      value: width,
    },
  });

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
