export async function loadGoogleFont({
  family,
  weight,
  text,
}: {
  family: string;
  weight?: number;
  text?: string;
}) {
  const params: Record<string, string> = {
    family: `${encodeURIComponent(family)}${weight ? `:wght@${weight}` : ""}`,
  };

  if (text) {
    params.text = text;
  } else {
    params.subset = "latin";
  }

  const url = `https://fonts.googleapis.com/css2?${Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&")}`;

  // @ts-expect-error - CacheStorage would use dom lib, but we're referring to CF worker's lib
  const cache = caches.default;
  const cacheKey = url;
  let res = await cache.match(cacheKey);

  if (!res) {
    res = await fetch(`${url}`, {
      headers: {
        // construct user agent to get TTF font
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    });

    res = new Response(res.body, res);
    res.headers.append("Cache-Control", "s-maxage=3600");

    await cache.put(cacheKey, res.clone());
  }

  const body = await res.text();
  // Get the font URL from the CSS text
  const fontUrl = body.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  )?.[1];

  if (!fontUrl) {
    throw new Error("Could not find font URL");
  }

  return fetch(fontUrl).then((res) => res.arrayBuffer());
}
