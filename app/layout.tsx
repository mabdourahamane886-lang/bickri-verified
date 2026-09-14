import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bickri Verified — Des organisations fiables pour une Afrique plus forte",
  description: "Bickri Verified : plateforme africaine de vérification, annuaire des organisations et badge vert de confiance.",
};

const HERO_FALLBACK = "https://images.unsplash.com/photo-1546166426-a1e742a67eaa?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWd0dWN0eA%3D%3D&ixlib=rb-4.1.0&q=80&w=1600";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          (() => {
            const fix = () => document.querySelectorAll('img').forEach(img => {
              if (img.getAttribute('src')?.includes('unsplash.com/photos/3VAF8cyTNZA/download')) {
                img.src = '${HERO_FALLBACK}';
              }
            });
            fix();
            new MutationObserver(fix).observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['src']});
          })();
        ` }} />
      </body>
    </html>
  );
}
