import type { Metadata } from "next";
import { Cormorant, Jost, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serif = Cormorant({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const sans = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-900/10 selection:text-stone-900">
        {children}
      </body>
    </html>
  );
}
