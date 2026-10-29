import { useEffect } from "react";
import { SITE_URL, type PageMeta } from "@/lib/seo";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sets document title, description, canonical, OG tags and page JSON-LD. */
export function usePageMeta(meta: PageMeta | null | undefined) {
  useEffect(() => {
    if (!meta) return;
    document.title = meta.title;
    const url = `${SITE_URL}${meta.path === "/" ? "/" : meta.path}`;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    if (meta.image) setMeta("property", "og:image", meta.image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    document.head.querySelectorAll('script[data-page-jsonld]').forEach((n) => n.remove());
    for (const block of meta.jsonLd ?? []) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-page-jsonld", "");
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
    }
  }, [meta]);
}
