"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <h2 className="text-xl font-bold mb-2">Une erreur est survenue</h2>
      <p className="text-sm text-gray-500 mb-6">
        Nous sommes désolés, quelque chose s&apos;est mal passé.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
