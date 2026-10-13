import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PULSO° — Estilo, identidade, movimento",
  description: "Conheça a demonstração visual da loja PULSO°.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
