import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  loader: {
    ".wasm": "copy",
  },
  minify: true,
  plugins: [dtsPlugin()],
}).catch(() => process.exit(1));
