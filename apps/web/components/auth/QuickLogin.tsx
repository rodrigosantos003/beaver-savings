"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { CredentialsForm } from "./CredentialsForm";
import { useRouter } from "@/i18n/navigation";

export function QuickLogin() {
  const t = useTranslations("nav");
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!isPending && session) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          onClick={() => {
            void authClient.signOut();
          }}
        >
          {t("signOut")}
        </button>
        <button
          type="button"
          className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          onClick={() => {
            router.push("/calculator")
          }}
        >
          {t("calculator")}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
        onClick={() => setOpen((current) => !current)}
      >
        {t("login")}
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg">
          <CredentialsForm mode="login" compact />
        </div>
      ) : null}
    </div>
  );
}
