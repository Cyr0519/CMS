import PublicHeader from "@/components/PublicHeader";

export default function PublicArticlesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <PublicHeader />
      <main>{children}</main>
      <footer className="border-t border-line px-4 py-8 text-center text-body-sm text-ink-muted">
        © {new Date().getFullYear()} Grace Info
      </footer>
    </div>
  );
}
