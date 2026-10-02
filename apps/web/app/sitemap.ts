import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = "https://beaver-savings.vercel.app";

// Public, indexable routes (no locale prefix)
const paths = ["", "/landing", "/calculator"];

const { defaultLocale, locales } = routing;
const otherLocales = locales.filter((l) => l !== defaultLocale);

const buildUrl = (locale: string, path: string) =>
    `${SITE_URL}/${locale}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
    return paths.map((path) => ({
        url: buildUrl(defaultLocale, path),
        lastModified: new Date(),
        alternates: {
            languages: Object.fromEntries(
                otherLocales.map((locale) => [locale, buildUrl(locale, path)])
            ),
        },
    }));
}