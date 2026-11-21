import type { Metadata, Viewport } from "next"

import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "SolarOS — Solar Operations Management",
    template: "%s · SolarOS",
  },
  description:
    "AI-powered solar installation management for Indian solar installers: enquiries, rooftop assessment, quotations, inventory, installation, monitoring and service in one place.",
  applicationName: "SolarOS",
}

export const viewport: Viewport = {
  themeColor: "#F1F2EF",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
