import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQL Story Game",
  description: "An interactive SQL learning game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
