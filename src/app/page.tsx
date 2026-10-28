import Link from "next/link"
import { Droplets, Shield, Zap, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Smart Treatment Reality Check",
    description:
      "Find out if your current water treatment method actually addresses the contaminants found in your test.",
  },
  {
    icon: Zap,
    title: "AI Explanation Engine",
    description:
      "Complex measurements translated into plain language with plausible contamination pathways and next steps.",
  },
  {
    icon: BarChart3,
    title: "Water Health Passport",
    description:
      "Track and compare historical test results across multiple water sources over time.",
  },
  {
    icon: Droplets,
    title: "Contamination Detective",
    description:
      "AI-powered analysis of possible contamination sources based on your readings and local context.",
  },
]

const parameters = [
  "pH", "Turbidity", "TDS", "Lead", "Arsenic",
  "Nitrates", "Fluoride", "Chlorine", "Bacterial Count",
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg tracking-tight">AquaVeris</span>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-24 px-4 bg-gradient-to-br from-accent via-background to-background">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="info" className="mb-2">
            AI-Powered Water Quality Intelligence
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Know what your water results{" "}
            <span className="text-primary">actually mean</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AquaVeris transforms complex water-quality test results into understandable
            risk assessments, treatment compatibility checks, and personalised action plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start free assessment <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in to dashboard</Link>
            </Button>
          </div>

          {/* Parameter tags */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {parameters.map((p) => (
              <span
                key={p}
                className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground border"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/40 border-t">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              From raw numbers to informed action
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              AquaVeris combines a deterministic rule engine with AI-generated guidance to answer
              the five questions that matter most after a water test.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            How it works
          </h2>
          <div className="space-y-5">
            {[
              "Create a water source profile (tap, borewell, river, etc.)",
              "Enter your available test results and select a reference standard",
              "Choose your current water treatment method",
              "Get an AI-powered report with explanations, treatment gaps, and next steps",
              "Save results and compare future tests over time",
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <p className="text-muted-foreground leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t bg-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-3 items-start text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-foreground">Educational tool only.</strong> AquaVeris
              provides risk assessment guidance and does not replace certified laboratory
              testing, official drinking-water advisories, or professional medical advice. Always
              consult qualified professionals for health decisions related to drinking water.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Droplets className="h-4 w-4 text-primary" />
          <span>AquaVeris &mdash; AI-Powered Water Quality Intelligence</span>
        </div>
      </footer>
    </div>
  )
}
