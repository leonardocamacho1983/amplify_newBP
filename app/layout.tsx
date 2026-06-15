import type { Metadata } from "next";
import "./globals.css";
import SideNav from "./components/SideNav";

export const metadata: Metadata = {
  title: "Amplify · Sala de decisão",
  description: "Documento interno dos sócios — persona, marca, mercado, modelo e BP vivo.",
  robots: { index: false, follow: false }, // privado, não indexar
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="shell">
          <SideNav />
          <div className="main">{children}</div>
        </div>
      </body>
    </html>
  );
}
