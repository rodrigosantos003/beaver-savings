// components/Header.tsx
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import { QuickLogin } from "@/components/auth/QuickLogin";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Header() {

    const hasSession = !!getSessionCookie(new Headers(await headers()));
    const t = await getTranslations();

    return (
        <nav className="flex items-center gap-3">
            <Link
                href="#features"
                className="hidden text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 sm:inline"
            >
                {t("nav.features")}
            </Link>
            <Link
                href="#how-it-works"
                className="hidden text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 sm:inline"
            >
                {t("nav.howItWorks")}
            </Link>
            <QuickLogin initialLoggedIn={hasSession} />
            <Link
                href="/signup"
                className={`inline-flex items-center justify-center rounded-full bg-secondary font-semibold text-white transition-colors hover:bg-secondary-hoverh-9 px-4 py-2 text-sm`}
            >
                {t("nav.getStarted")}
            </Link>
        </nav>
    );

}