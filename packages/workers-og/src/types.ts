import type { SatoriOptions } from "satori/wasm";

export interface ImageResponseOptions {
  width?: number;
  height?: number;
  // emoji?: 'twemoji' | 'blobmoji' | 'noto' | 'openmoji' = 'twemoji',
  fonts?: SatoriOptions["fonts"];
  debug?: boolean;

  // Options that will be passed to the HTTP response
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;

  // Format
  format?: "svg" | "png"; // Defaults to 'png'
}
