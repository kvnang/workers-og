import { build } from "esbuild";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  loader: {
    ".wasm": "copy",
  },
}).catch(() => process.exit(1));
