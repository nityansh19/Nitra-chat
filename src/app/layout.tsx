import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nitra Chat",
  description: "A premium real-time communication workspace."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
