import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  loader: {
    ".wasm": "binary",
  },
  minify: true,
  plugins: [dtsPlugin()],
}).catch(() => process.exit(1));
