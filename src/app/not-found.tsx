import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-6xl font-bold text-gray-200 mb-4">404</h2>
      <p className="text-lg font-semibold mb-1">Page introuvable</p>
      <p className="text-sm text-gray-500 mb-6">
        La page que vous cherchez n&apos;existe pas.
      </p>
      <Link
        href="/conversation"
        className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm text-white font-medium hover:bg-blue-800 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
