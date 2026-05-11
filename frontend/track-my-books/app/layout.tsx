import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/_context/AuthContext";

export const metadata: Metadata = {
  title: "Track My Books – Twoja cyfrowa biblioteka",
  description: "Śledź swoją czytelniczą podróż. Kataloguj książki, odkrywaj nowości i dziel się rekomendacjami.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
