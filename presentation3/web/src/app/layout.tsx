import type { Metadata, Viewport } from "next"
import { AppAuthProvider } from "@/lib/clerk"
import "../index.css"

export const metadata: Metadata = {
  title: "Licentra — Enterprise Software License & Governance",
  description:
    "Enterprise SaaS and software asset management, 3NF relational schema governance, contract renewals, and seat allocations.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#f5f6fb] text-[#18203f]">
        <AppAuthProvider>{children}</AppAuthProvider>
      </body>
    </html>
  )
}
