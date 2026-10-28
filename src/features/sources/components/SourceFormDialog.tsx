"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Plus, Sparkles } from "lucide-react"
import { createSourceAction, updateSourceAction } from "@/features/sources/actions"
import { SOURCE_TYPES, TREATMENT_METHODS } from "@/features/sources/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SourceFormDialogProps {
  source?: {
    id: string
    source_name: string
    source_type: string
    treatment_method: string | null
  }
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export default function SourceFormDialog({ source, trigger, onSuccess }: SourceFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sourceName, setSourceName] = useState(source?.source_name ?? "")
  const [sourceType, setSourceType] = useState(source?.source_type ?? "municipal")
  const [treatmentMethod, setTreatmentMethod] = useState(source?.treatment_method ?? "none")

  const isEditing = Boolean(source)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("sourceName", sourceName)
    formData.append("sourceType", sourceType)
    formData.append("treatmentMethod", treatmentMethod)

    const result = isEditing && source
      ? await updateSourceAction(source.id, formData)
      : await createSourceAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message ?? "Water source saved")
      setOpen(false)
      if (!isEditing) {
        setSourceName("")
        setSourceType("municipal")
        setTreatmentMethod("none")
      }
      onSuccess?.()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Water Source
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Water Source" : "Add New Water Source"}</DialogTitle>
          <DialogDescription>
            Identify your water supply location and the primary treatment method used at point-of-use.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sourceName">Source Name / Location</Label>
            <Input
              id="sourceName"
              placeholder="e.g. Kitchen Tap, Main Borewell, Office Cooler"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceType">Water Origin / Source Type</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="treatmentMethod">Current Treatment Method</Label>
              <span className="text-[11px] text-primary flex items-center gap-1 font-medium">
                <Sparkles className="h-3 w-3" /> ActionIQ Reality Check
              </span>
            </div>
            <Select value={treatmentMethod} onValueChange={setTreatmentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select treatment method" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used to check if your treatment is chemically and biologically effective for your water test results.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

