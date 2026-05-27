import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const jpmamLight = localFont({
  src: [
    { path: "./fonts/jpmamprolig.woff2", weight: "300", style: "normal" },
    { path: "./fonts/jpmamproligita.woff2", weight: "300", style: "italic" },
  ],
  variable: "--font-jpmam-light",
  display: "swap",
});

const jpmamBook = localFont({
  src: [
    { path: "./fonts/jpmamproboo.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jpmamprobooita.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-jpmam-book",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JPMAM Cards",
  description: "Flip-card interactive layout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jpmamLight.variable} ${jpmamBook.variable} antialiased`}
    >
      <body className="bg-black font-sans">{children}</body>
    </html>
  );
}
