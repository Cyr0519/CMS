import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-wide text-primary">Grace Info</Link>
        <nav aria-label="Navigation publique" className="flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="text-gray-600 hover:text-accent">Accueil</Link>
          <Link href="/articles" className="text-gray-600 hover:text-accent">Articles</Link>
          <Link href="/login" className="rounded-lg bg-primary px-3 py-2 text-white hover:bg-secondary">Espace rédaction</Link>
        </nav>
      </div>
    </header>
  );
}
