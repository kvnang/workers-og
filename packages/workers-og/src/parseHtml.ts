import camelCase from "just-camel-case";
import { ReactElementLike } from "./types";

const sanitizeJSON = (unsanitized: string) => {
  return (
    unsanitized
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\f/g, "\\f")
      .replace(/"/g, '\\"')
      // .replace(/'/g, "\\'")
      .replace(/\&/g, "\\&")
  );
};

const getAttributes = (element: Element) => {
  let attrs = "";

  const style = element.getAttribute("style");

  if (style) {
    const cleanStyle = style.replace(/\n/g, "").replace(/\s\s+/g, " ");

    let styleStr = cleanStyle.split(";").reduce<string>((acc, cur) => {
      const [k, v] = cur.split(":");
      if (k && v) {
        const camelCaseKey = camelCase(k.trim());
        acc += `"${camelCaseKey}": "${sanitizeJSON(v.trim())}",`;
      }
      return acc;
    }, "");

    if (styleStr.endsWith(",")) {
      styleStr = styleStr.slice(0, -1);
    }

    if (styleStr) {
      attrs += `"style":{${styleStr}},`;
    }
  }

  const src = element.getAttribute("src");

  if (src) {
    const width = element.getAttribute("width");
    const height = element.getAttribute("height");

    if (width && height) {
      attrs += `"src":"${sanitizeJSON(
        src
      )}", "width":"${width}", "height":"${height}",`;
    } else {
      console.warn(
        "Image missing width or height attribute as required by Satori"
      );
      attrs += `"src":"${sanitizeJSON(src)}",`;
    }
  }

  return attrs;
};

export async function parseHtml(
  html: string
): Promise<ReactElementLike | null> {
  let vdomStr = ``;
  const rewriter = new HTMLRewriter()
    .on("*", {
      element(element: Element) {
        const attrs = getAttributes(element);
        console.log(attrs);
        vdomStr += `{"type":"${element.tagName}", "props":{${attrs}"children": [`;
        try {
          element.onEndTag(() => {
            if (vdomStr.endsWith(",")) {
              vdomStr = vdomStr.slice(0, -1);
            }
            vdomStr += `]}},`;
          });
        } catch (e) {
          if (vdomStr.endsWith(",")) {
            vdomStr = vdomStr.slice(0, -1);
          }
          vdomStr += `]}},`;
        }
      },
      text(text: Text) {
        if (text.text) {
          const sanitized = sanitizeJSON(text.text);
          if (sanitized) {
            vdomStr += `"${sanitized}",`;
          }
        }
      },
    })
    .transform(
      new Response(
        `<div style="display: flex; flex-direction: column;">${html}</div>`
      )
    );

  await rewriter.text();

  if (vdomStr.endsWith(",")) {
    vdomStr = vdomStr.slice(0, -1);
  }

  try {
    return JSON.parse(vdomStr);
  } catch (e) {
    console.error(e);
    return null;
  }
}
