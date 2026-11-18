import "./globals.css";
import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Doces da Lê & Li",
  description: "Pavês, brigadeiros, trufas e bombons artesanais, feitos com carinho. Faça sua encomenda!",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><Header />{children}<Footer /></body>
    </html>
  );
}
