import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Megalight II — Maison flottante sur Seine, Sèvres",
  description:
    "La maison flottante de Captain Philippe, amarrée au Parc Nautique de l'Île de Monsieur, aux portes de Paris. Deux chambres sur la Seine, petit-déjeuner face au fleuve. Réservation directe.",
  // Outil confidentiel réservé aux clients existants : pas d'indexation.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${serif.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-night text-slate-300 selection:bg-amber-200/20 selection:text-amber-100">
        {children}
      </body>
    </html>
  );
}
