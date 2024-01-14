import type { ImageResponse } from "@vercel/og";

type VercelImageResponseOptions = NonNullable<
  ConstructorParameters<typeof ImageResponse>[1]
>;

export interface ImageResponseOptions extends VercelImageResponseOptions {
  /**
   * The format of the image.
   * @default "png"
   */
  format?: "svg" | "png" | undefined; // Defaults to 'png'
}
