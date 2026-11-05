import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nafass B. | Customer Feedback",
  description: "Share your experience with Nafass B. and help us improve.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
