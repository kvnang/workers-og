import { Parser } from "htmlparser2";
import { DomHandler } from "domhandler";
import { ReactElementLikeProps, TransformNode } from "./types";
import camelCase from "just-camel-case";

// TODO: Improve parser performance by using Cloudflare's parser

/**
 * Convert the DOM tree into a React element
 */
const transformNode: TransformNode = (node) => {
  if (
    node.type === "comment" ||
    node.type === "directive" ||
    node.type === "cdata" ||
    node.type === "root"
  ) {
    return;
  }

  if (node.type === "text") {
    return node.data;
  }

  const props: ReactElementLikeProps = {};

  const children = "children" in node ? node.children : null;
  const attribs = "attribs" in node ? node.attribs : null;

  if (children) {
    props["children"] = children.map(transformNode);
  }

  if (attribs) {
    for (const [key, value] of Object.entries(attribs)) {
      if (key === "style") {
        const cleanStyle = value.replace(/\n/g, "").replace(/\s\s+/g, " ");

        props["style"] = cleanStyle
          .split(";")
          .reduce<Record<string, any>>((acc, cur) => {
            const [k, v] = cur.split(":");
            if (k && v) {
              const camelCaseKey = camelCase(k.trim());
              acc[camelCaseKey] = v.trim();
            }
            return acc;
          }, {});
      } else {
        props[key] = value;
      }
    }
  }

  return {
    type: node.name,
    props,
  };
};

export const parseHtml = (html: string) => {
  // remove whitespace from html
  const cleanHtml = html.replace(/<!--(.*?)-->|\s\B/gm, " ").trim();

  // parse html into a DOM tree
  const handler = new DomHandler();
  const parser = new Parser(handler);
  parser.parseComplete(cleanHtml);

  // convert DOM tree into a React element-like object
  const tree = handler.dom.map((node) => {
    const transformed = transformNode(node);
    return transformed;
  });

  // here we assume that there's only one parent element as per React's rules
  // if there's more, we'll just return the first one and console.warn
  if (tree.length > 1) {
    console.warn(
      `The HTML you provided has more than one root element. Only the first one will be rendered.`
    );
  }

  return tree[0];
};
