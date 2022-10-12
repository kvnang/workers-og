import type { ChildNode } from "domhandler";

export type ReactElementLikeProps =
  | {
      children?: (ReactElementLike | undefined)[];
      style?:
        | string
        | number
        | boolean
        | Record<string, string | number>
        | null
        | undefined;
      [key: string]: any;
    }
  | null
  | undefined;

export type ReactElementLike =
  | string
  | {
      type: string;
      props: ReactElementLikeProps;
    };

export type TransformNode = (node: ChildNode) => ReactElementLike | undefined;

export interface ImageResponseOptions {
  width?: number;
  height?: number;
  // emoji?: 'twemoji' | 'blobmoji' | 'noto' | 'openmoji' = 'twemoji',
  fonts?: {
    name: string;
    data: ArrayBuffer;
    weight: number;
    style: "normal" | "italic";
  }[];
  debug?: boolean;

  // Options that will be passed to the HTTP response
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}
