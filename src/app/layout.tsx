import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserMenu } from "@/components/UserMenu";
import { Suspense } from "react";
import IntroLoader from "@/components/IntroLoader";
import LoadingAnimation from "@/components/LoadingAnimation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Abhivairavan RetailOS",
  description: "Premium retail data management for sanitaryware dealers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <IntroLoader />
        <Suspense fallback={null}>
          <LoadingAnimation />
        </Suspense>
        <header className="bg-white border-b border-slate-200 py-4 px-6 fixed top-0 w-full z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight">
              Abhivairavan <span className="text-slate-400 font-medium">x</span> <span className="text-slate-900">Zoink digital designs</span>
            </h1>
            <UserMenu />
          </div>
        </header>
        <main className="pt-20 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
