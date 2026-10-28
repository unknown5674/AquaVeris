import { Droplets } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent via-background to-background px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <Droplets className="h-7 w-7 text-primary" />
        <span className="font-semibold text-xl tracking-tight group-hover:text-primary transition-colors">
          AquaVeris
        </span>
      </Link>
      {/* Card */}
      <div className="w-full max-w-md">{children}</div>
      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
        Educational risk-assessment tool only. Not a substitute for certified laboratory testing or
        professional medical advice.
      </p>
    </div>
  )
}

