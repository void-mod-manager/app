"use client";
import { Sidebar } from "@/components/sidebar";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="flex h-screen bg-background text-foreground">
          <Sidebar />
          <main className="flex-1 overflow-auto p-2 pb-0 pr-0">
            {children}

          </main>
        </div>
      </body>
    </html>
  )
}
