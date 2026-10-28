"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Sparkles, TestTube, CheckCircle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SuggestedTest {
  parameterName: string
  priority: "HIGH" | "MEDIUM" | "RECOMMENDED"
  reason: string
  commonSources: string
}

interface TestSelectionAssistantModalProps {
  untestedParameters: string[]
  flaggedParameters: string[]
  sourceType: string
}

export default function TestSelectionAssistantModal({
  untestedParameters,
  flaggedParameters,
  sourceType,
}: TestSelectionAssistantModalProps) {
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedTest[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function handleOpenAnalysis() {
    setOpen(true)
    if (suggestions.length > 0) return

    setIsLoading(true)
    // Intelligent heuristic suggestion based on missing parameters and water source
    const results: SuggestedTest[] = []

    if (untestedParameters.includes("bacteria") || untestedParameters.includes("E. coli / Coliform Count")) {
      results.push({
        parameterName: "Microbiological (E. coli / Total Coliform)",
        priority: "HIGH",
        reason:
          sourceType === "borewell" || sourceType === "surface_water"
            ? "Groundwater and surface sources have high vulnerability to agricultural or sewage runoff."
            : "Pathogenic bacteria pose immediate gastrointestinal health risks and must be non-detectable.",
        commonSources: "Septic tanks, sewage cross-connections, animal manure runoff.",
      })
    }

    if (untestedParameters.includes("lead") || untestedParameters.includes("Lead (Pb)")) {
      results.push({
        parameterName: "Lead (Heavy Metal)",
        priority: "HIGH",
        reason: "Lead is odorless and colorless. Most lead enters water through corroding lead service lines or brass fixtures.",
        commonSources: "Aging service lines, lead-soldered copper pipes, older plumbing brass.",
      })
    }

    if (untestedParameters.includes("nitrates") || untestedParameters.includes("Nitrates (NO3)")) {
      results.push({
        parameterName: "Nitrates (NO3)",
        priority: "MEDIUM",
        reason: "Nitrates are particularly hazardous for infants (Blue Baby Syndrome) and cannot be removed by boiling.",
        commonSources: "Agricultural fertilizers, animal feedlots, leaking sewer systems.",
      })
    }

    if (untestedParameters.includes("arsenic") || untestedParameters.includes("Arsenic (As)")) {
      results.push({
        parameterName: "Arsenic (As)",
        priority: sourceType === "borewell" ? "HIGH" : "RECOMMENDED",
        reason: "Natural geological deposits often leach toxic arsenic into deep aquifer borewells.",
        commonSources: "Bedrock mineral dissolution, industrial discharges.",
      })
    }

    if (results.length === 0) {
      results.push({
        parameterName: "Seasonal Retest Panel",
        priority: "RECOMMENDED",
        reason: "All core parameters were tested in this session! Run a periodic follow-up after the next rainy season.",
        commonSources: "Seasonal monsoon aquifer fluctuation.",
      })
    }

    setSuggestions(results)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenAnalysis}
          className="gap-2 border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Test-Selection Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" /> AI Decision Support
          </div>
          <DialogTitle>Recommended Follow-Up Laboratory Tests</DialogTitle>
          <DialogDescription className="text-xs">
            Personalized guidance on which additional water quality parameters to prioritize based on your water source ({sourceType}) and untested gaps.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Analyzing untested parameters and local risk profiles...</span>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border p-3.5 space-y-1.5 bg-card hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <TestTube className="h-4 w-4 text-primary" />
                    {item.parameterName}
                  </span>
                  <Badge
                    variant={
                      item.priority === "HIGH"
                        ? "destructive"
                        : item.priority === "MEDIUM"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {item.priority} PRIORITY
                  </Badge>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{item.reason}</p>
                <p className="text-[11px] text-muted-foreground pt-1 border-t">
                  <span className="font-medium">Primary Infiltration Vector:</span> {item.commonSources}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

