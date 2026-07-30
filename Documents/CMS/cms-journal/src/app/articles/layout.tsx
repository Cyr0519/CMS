import PublicHeader from "@/components/PublicHeader";

export default function PublicArticlesLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5f5f7]"><PublicHeader /><main>{children}</main></div>;
}
