import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyMUA — The Website Platform Built Exclusively for Makeup Artists",
  description:
    "Create a stunning website in minutes. Showcase your portfolio, services, pricing, availability, testimonials, and booking details—all from a single link designed exclusively for makeup artists.",
  openGraph: {
    title: "MyMUA — Your Makeup Brand Starts Here",
    description:
      "The premium online brand platform built exclusively for makeup artists. Turn your Instagram into your best salesperson.",
    url: "https://mymua.in",
    siteName: "MyMUA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-near-black font-sans antialiased">{children}</body>
    </html>
  );
}
