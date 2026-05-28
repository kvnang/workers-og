import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  format: "esm",
  // Keep `.wasm` imports as external ES module imports rather than inlining the
  // bytes. With the `binary` loader, esbuild embedded each .wasm as a Uint8Array,
  // so at runtime resvg/yoga received raw bytes and called
  // `WebAssembly.instantiate(bytes)` — which Cloudflare's workerd forbids
  // ("Wasm code generation disallowed by embedder"). Left as real imports, the
  // downstream bundler (Vite + @astrojs/cloudflare) compiles them into
  // precompiled `WebAssembly.Module` instances at deploy time. The vendored
  // .wasm files ship alongside `dist/` (see `files` in package.json), so the
  // emitted `../vendors/*.wasm` import paths resolve from the installed package.
  external: ["*.wasm"],
  minify: true,
  plugins: [dtsPlugin()],
}).catch(() => process.exit(1));
