"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={cn("btn btn-secondary focus-ring px-4 py-2", className)}
    >
      {isPending ? "Saindo..." : "Sair"}
    </button>
  );
}
