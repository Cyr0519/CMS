"use client";

import { useEffect, useState } from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const COLLAPSE_KEY = "gi:sidebar-collapsed";

/**
 * Coquille du CMS : la sidebar flotte au-dessus du fond, le contenu occupe
 * le reste de la largeur. Le repli est mémorisé d'une session à l'autre.
 */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Lu après l'hydratation, comme ailleurs dans le projet, pour ne pas
  // désynchroniser le rendu serveur et le rendu client.
  useEffect(() => {
    void Promise.resolve().then(() => setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1"));
  }, []);

  function toggleCollapse() {
    setCollapsed((value) => {
      window.localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      return !value;
    });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        open={drawerOpen}
        collapsed={collapsed}
        onClose={() => setDrawerOpen(false)}
        onToggleCollapse={toggleCollapse}
      />
      <div className={`min-h-screen transition-[padding] duration-200 ease-out ${collapsed ? "lg:pl-[84px]" : "lg:pl-[260px]"}`}>
        <div className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6 lg:px-8">
          <Header onMenuToggle={() => setDrawerOpen((value) => !value)} />
          <main className="pt-2">{children}</main>
        </div>
      </div>
    </div>
  );
}
