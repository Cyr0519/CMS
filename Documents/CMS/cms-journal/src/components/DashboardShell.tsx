"use client";

import { useState } from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-primary">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen((value) => !value)} />
      <main className="min-h-screen pt-16 lg:pl-[260px]"><div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div></main>
    </div>
  );
}
