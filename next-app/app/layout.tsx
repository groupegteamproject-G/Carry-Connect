import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "CarryConnect",
  description: "Send packages globally with trusted travelers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
      </head>

      <body>
        {/* NAVBAR (always at top) */}
        <Navbar />

        {/* MAIN PAGE CONTENT */}
        <main>{children}</main>

        {/* FOOTER (always at bottom) */}
        <Footer />
      </body>
    </html>
  );
}
