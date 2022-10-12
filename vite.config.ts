import { resolve } from "path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    // wasm(),
    // topLevelAwait(),
    viteStaticCopy({
      targets: [
        {
          src: "vendors/*",
          dest: "vendors",
        },
      ],
    }),
    dts(),
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "workers-og",
      // the proper extensions will be added
      fileName: "index",
      formats: ["es"],
    },
  },
});
