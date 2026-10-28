"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Droplets, Edit, Trash2, TestTube2, AlertCircle } from "lucide-react"
import { deleteSourceAction } from "@/features/sources/actions"
import { SOURCE_TYPES, TREATMENT_METHODS } from "@/features/sources/constants"
import SourceFormDialog from "@/features/sources/components/SourceFormDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SourceCardProps {
  source: {
    id: string
    source_name: string
    source_type: string
    treatment_method: string | null
    created_at: string
  }
}

export default function SourceCard({ source }: SourceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const typeLabel =
    SOURCE_TYPES.find((t) => t.value === source.source_type)?.label ?? source.source_type
  const treatmentLabel =
    TREATMENT_METHODS.find((m) => m.value === source.treatment_method)?.label ??
    (source.treatment_method || "None / Raw")

  async function handleDelete() {
    if (!confirm(`Are you sure you want to remove "${source.source_name}"?`)) {
      return
    }

    setIsDeleting(true)
    const res = await deleteSourceAction(source.id)
    if (res.error) {
      toast.error(res.error)
      setIsDeleting(false)
    } else {
      toast.success("Source deleted")
    }
  }

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{source.source_name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{typeLabel}</p>
            </div>
          </div>
          <Badge variant={source.treatment_method === "none" ? "warning" : "info"}>
            {source.treatment_method === "none" ? "Untreated" : "Treated"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-4 text-xs">
        <div className="rounded-md bg-muted/60 p-2.5 space-y-1">
          <div className="text-muted-foreground font-medium">Applied Treatment:</div>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            {source.treatment_method === "none" && (
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            )}
            {treatmentLabel}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t flex items-center justify-between gap-2">
        <Button variant="default" size="sm" asChild className="gap-1.5 flex-1">
          <Link href={`/dashboard/tests/new?sourceId=${source.id}`}>
            <TestTube2 className="h-3.5 w-3.5" />
            Test Water
          </Link>
        </Button>

        <div className="flex items-center gap-1">
          <SourceFormDialog
            source={source}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={handleDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

