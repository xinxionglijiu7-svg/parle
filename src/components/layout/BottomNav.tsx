"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, History, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/conversation", label: "Parler", icon: MessageCircle },
  { href: "/history", label: "Historique", icon: History },
  { href: "/vocabulary", label: "Vocabulaire", icon: BookOpen },
  { href: "/progress", label: "Progrès", icon: TrendingUp },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors min-w-[64px]",
                isActive
                  ? "text-blue-900 font-medium"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
