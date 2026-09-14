import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bickri Verified — Des organisations fiables pour une Afrique plus forte",
  description: "Bickri Verified : plateforme africaine de vérification, annuaire des organisations et badge vert de confiance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
