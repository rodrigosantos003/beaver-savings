import { getTranslations } from "next-intl/server";
import { BeaverLogo } from "@/components/BeaverLogo";
import { CredentialsForm } from "@/components/auth/CredentialsForm";
import { Link } from "@/i18n/navigation";

type AuthScreenProps = {
  mode: "login" | "signup";
};

export async function AuthScreen({ mode }: AuthScreenProps) {
  const t = await getTranslations("auth");
  const isSignup = mode === "signup";

  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/landing" className="flex items-center gap-2.5">
            <BeaverLogo className="h-8 w-8 shrink-0" />
            <span className="text-lg font-semibold tracking-tight text-beaver-900">
              Beaver Savings
            </span>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          {t(isSignup ? "signupTitle" : "loginTitle")}
        </h1>
        <p className="mt-3 text-stone-600">
          {t(isSignup ? "signupDescription" : "loginDescription")}
        </p>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <CredentialsForm mode={mode} />
        </div>
      </main>
    </div>
  );
}
