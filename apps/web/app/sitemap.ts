import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = "https://beaver-savings.vercel.app";

// Add every public route here (without locale prefix)
const paths = ["", "/landing", "/calculator", "/login", "/signup"];

export default function sitemap(): MetadataRoute.Sitemap {
    return paths.flatMap((path) =>
        routing.locales.map((locale) => ({
            url: `${SITE_URL}/${locale}${path}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: path === "" ? 1 : 0.7,
            alternates: {
                languages: Object.fromEntries(
                    routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])
                ),
            },
        }))
    );
}