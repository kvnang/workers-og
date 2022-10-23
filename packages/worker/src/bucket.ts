import { Env, PATTERNS } from ".";

export async function handleBucketRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const key = PATTERNS.bucket.exec(request.url)?.pathname?.groups?.key;

  if (!key) {
    return new Response("Key not provided", { status: 404 });
  }

  switch (request.method) {
    case "GET":
      const object = await env.OG_BUCKET.get(key);

      if (object === null) {
        return new Response("Object Not Found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      return new Response(object.body, {
        headers,
      });
    // case "PUT":
    //   await env.OG_BUCKET.put(key, request.body);
    //   return new Response(`Put ${key} successfully!`);
    // case "DELETE":
    //   await env.OG_BUCKET.delete(key);
    //   return new Response("Deleted!");
    default:
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          // Allow: "PUT, GET, DELETE",
          Allow: "GET",
        },
      });
  }
}
