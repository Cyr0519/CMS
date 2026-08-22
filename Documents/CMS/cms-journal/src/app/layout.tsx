import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Inter pour l'interface et les chiffres (excellente lisibilité en petit corps),
// Plus Jakarta Sans pour les titres (géométrie plus affirmée). Deux familles, pas plus.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Grace Info",
  description: "CMS éditorial Grace Info",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
      // Certaines extensions de navigateur ajoutent leurs propres attributs sur
      // <html> avant React. La suppression ne porte que sur cet élément : les
      // écarts d'hydratation réels, à l'intérieur de l'arbre, restent signalés.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">{children}</body>
    </html>
  );
}
