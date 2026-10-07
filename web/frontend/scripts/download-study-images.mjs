import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const types = new Set([
  "platforms",
  "universities",
  "bootcamps",
  "roadmaps",
  "books",
  "certifications",
]);
const catalog = JSON.parse(
  await readFile(resolve(root, "src/generated/catalog.json"), "utf8"),
);
const resources = catalog.resources.filter((r) => types.has(r.type) && !r.demo);
const destination = resolve(root, "src/assets/study");
const overrides = JSON.parse(
  await readFile(
    resolve(import.meta.dirname, "study-image-overrides.json"),
    "utf8",
  ),
);
const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((m) => [
      m[1].toLowerCase(),
      decode(m[2]),
    ]),
  );
}
async function get(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}
const results = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < resources.length) {
      const resource = resources[cursor++];
      const override = overrides[`${resource.type}/${resource.slug}`];
      const candidates = override ? [override] : [];
      let pageUrl = resource.url;
      try {
        const response = await get(resource.url);
        pageUrl = response.url;
        const html = await response.text();
        const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) =>
          attributes(m[0]),
        );
        const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) =>
          attributes(m[0]),
        );
        const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) =>
          attributes(m[0]),
        );
        const logos = images
          .filter((a) =>
            /logo|brand/i.test([a.alt, a.class, a.id, a.src].join(" ")),
          )
          .map((a) => ({ url: a.src || a["data-src"], kind: "logo" }));
        const social = metas
          .filter((a) =>
            ["og:image", "og:image:secure_url", "twitter:image"].includes(
              a.property || a.name,
            ),
          )
          .map((a) => ({ url: a.content, kind: "social" }));
        const bookCovers = images
          .filter((a) =>
            /cover|capa|book|[123]e\./i.test([a.alt, a.src].join(" ")),
          )
          .map((a) => ({ url: a.src, kind: "cover" }));
        const icons = links
          .filter((a) => /icon/i.test(a.rel || "") && !/mask/i.test(a.rel))
          .map((a) => ({ url: a.href, kind: "icon" }));
        candidates.push(
          ...(resource.type === "books"
            ? [...bookCovers, ...social, ...logos]
            : [...logos, ...social]),
          ...icons,
        );
      } catch (error) {
        resource.pageError = error.message;
      }
      candidates.push(
        { url: new URL("/apple-touch-icon.png", pageUrl).href, kind: "icon" },
        { url: new URL("/favicon.ico", pageUrl).href, kind: "icon" },
      );
      let saved;
      for (const candidate of candidates
        .filter((c) => c.url && !c.url.startsWith("data:"))
        .slice(0, 12)) {
        try {
          const url = new URL(candidate.url, pageUrl).href;
          const response = await get(url);
          const bytes = Buffer.from(await response.arrayBuffer());
          if (bytes.length < 150 || bytes.length > 4000000) continue;
          const contentType = response.headers.get("content-type") || "";
          const extension = contentType.includes("svg")
            ? "svg"
            : contentType.includes("png")
              ? "png"
              : contentType.includes("jpeg")
                ? "jpg"
                : contentType.includes("webp")
                  ? "webp"
                  : contentType.includes("gif")
                    ? "gif"
                    : contentType.includes("avif")
                      ? "avif"
                      : contentType.includes("icon")
                        ? "ico"
                        : null;
          if (
            !extension ||
            (extension === "svg" &&
              /<script|<foreignObject|\son\w+=/i.test(bytes.toString()))
          )
            continue;
          const folder = resolve(destination, resource.type);
          await mkdir(folder, { recursive: true });
          const file = `${resource.type}/${resource.slug}.${extension}`;
          await writeFile(resolve(destination, file), bytes);
          saved = {
            key: `${resource.type}/${resource.slug}`,
            name: resource.name,
            page: resource.url,
            source: response.url,
            kind: candidate.kind,
            file,
            bytes: bytes.length,
            checkedAt: new Date().toISOString(),
          };
          break;
        } catch {}
      }
      results.push(
        saved || {
          key: `${resource.type}/${resource.slug}`,
          name: resource.name,
          page: resource.url,
          error: resource.pageError || "No usable image",
        },
      );
      console.log(
        resource.slug,
        saved ? `${saved.kind} ${saved.bytes}` : "MISSING",
      );
    }
  }),
);
await mkdir(destination, { recursive: true });
await writeFile(
  resolve(destination, "sources.json"),
  JSON.stringify(
    results.sort((a, b) => a.key.localeCompare(b.key)),
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    total: results.length,
    downloaded: results.filter((r) => r.file).length,
    missing: results.filter((r) => !r.file).map((r) => r.key),
  }),
);
