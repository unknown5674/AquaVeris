import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "AquaVeris ActionIQ",
    template: "%s | AquaVeris ActionIQ",
  },
  description:
    "AI-powered water quality intelligence. Transform test results into understandable risk assessments and personalised action plans.",
  keywords: ["water quality", "water testing", "drinking water safety", "water treatment"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
