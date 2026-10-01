import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/formations",
    "/a-propos",
    "/a-propos/notre-mission",
    "/a-propos/comment-ca-marche",
    "/plateforme/auto-evaluation",
    "/plateforme/score-news",
    "/plateforme/evenements-indesirables",
    "/login",
    "/inscription",
    "/conditions-utilisation",
    "/politique-confidentialite",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
