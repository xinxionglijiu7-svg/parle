import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4">Parle!</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Pratiquez votre français avec un ami marseillais
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-blue-900 px-6 py-3 text-white font-medium hover:bg-blue-800 transition-colors"
      >
        Commencer
      </Link>
    </main>
  );
}
