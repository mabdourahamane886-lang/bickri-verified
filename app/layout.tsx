import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bickri Verified — Badge Vert Africain",
  description: "Bickri Verified — une reconnaissance fondée sur des preuves.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
