"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { removeTokenCookie } from "@/app/(auth)/actions";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    localStorage.removeItem("token");
    await removeTokenCookie();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-lg font-bold tracking-tight">Parle!</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Se déconnecter"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
