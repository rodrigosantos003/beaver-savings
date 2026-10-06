import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Calculator } from "@/components/calculator/Calculator";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Header } from "@/components/header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calculator");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function CalculatorPage() {
  const t = await getTranslations("calculator");

  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Image src="/beaver-savings.png" alt="Beaver Savings" width={42} height={42} />
            <span className="text-lg font-semibold tracking-tight text-beaver-900">
              Beaver Savings
            </span>
          </Link>
          <Header />
        </div>

      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 print:max-w-none print:px-0 print:py-4">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-stone-600">{t("description")}</p>
        <div className="mt-8">
          <Calculator />
        </div>
      </main>
    </div>
  );
}