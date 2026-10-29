// Post-build step: writes per-route HTML files with their own <title>,
// meta description, canonical URL, Open Graph tags and JSON-LD, plus
// sitemap.xml. The SPA still hydrates normally; crawlers and link
// previews get correct metadata without running JavaScript.
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { miners } from "../client/src/data/miners";
import { minerImages } from "../client/src/data/miner-images";
import {
  SITE_URL,
  homeMeta,
  learnMeta,
  disclaimerMeta,
  minerMeta,
  type PageMeta,
} from "../client/src/lib/seo";

const OUT = path.resolve(import.meta.dirname, "..", "dist", "public");

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function render(template: string, meta: PageMeta): string {
  const url = `${SITE_URL}${meta.path === "/" ? "/" : meta.path}`;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(meta.description)}">`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(meta.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(meta.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  if (meta.image) {
    html = html.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${meta.image}" />`);
  }
  if (meta.jsonLd?.length) {
    const blocks = meta.jsonLd
      .map((b) => `<script type="application/ld+json" data-page-jsonld>${JSON.stringify(b).replace(/</g, "\\u003c")}</script>`)
      .join("\n    ");
    html = html.replace("</head>", `    ${blocks}\n  </head>`);
  }
  return html;
}

// "/miner/x" -> dist/public/miner/x.html. vercel.json sets cleanUrls, so
// Vercel serves it at /miner/x (and redirects /miner/x.html there).
async function writePage(route: string, html: string) {
  const file = route === "/" ? path.join(OUT, "index.html") : path.join(OUT, `${route}.html`);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

export async function prerender() {
  const template = await readFile(path.join(OUT, "index.html"), "utf-8");
  for (const needle of ["<title>", 'name="description"', 'rel="canonical"', 'property="og:url"']) {
    if (!template.includes(needle)) throw new Error(`index.html template is missing ${needle}`);
  }
  const pages: PageMeta[] = [
    homeMeta,
    learnMeta,
    disclaimerMeta,
    ...miners.map((m) => minerMeta(m, minerImages[m.id])),
  ];
  for (const p of pages) await writePage(p.path, render(template, p));

  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => {
      const prio = p.path === "/" ? "1.0" : p.path.startsWith("/miner/") ? "0.8" : "0.5";
      return `  <url><loc>${SITE_URL}${p.path === "/" ? "/" : p.path}</loc><lastmod>${today}</lastmod><priority>${prio}</priority></url>`;
    })
    .join("\n");
  await writeFile(
    path.join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  console.log(`prerendered ${pages.length} pages + sitemap.xml`);
}
