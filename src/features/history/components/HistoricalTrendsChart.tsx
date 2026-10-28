"use client"

import { useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ParameterHistoryPoint {
  date: string
  sessionId: string
  value: number | null
  unit: string | null
  status: string
  referenceMax: number | null
}

interface HistoricalTrendsChartProps {
  parameterHistory: Record<string, ParameterHistoryPoint[]>
  parameterNames: Record<string, string>
}

export default function HistoricalTrendsChart({
  parameterHistory,
  parameterNames,
}: HistoricalTrendsChartProps) {
  const availableParams = Object.keys(parameterHistory).filter(
    (code) => parameterHistory[code].length > 0
  )

  const [selectedParam, setSelectedParam] = useState<string>(
    availableParams[0] || "ph"
  )

  const points = parameterHistory[selectedParam] ?? []
  const chartData = points.map((p) => ({
    date: p.date,
    value: p.value,
    unit: p.unit,
    status: p.status,
    limit: p.referenceMax,
  }))

  const referenceLimit = points[0]?.referenceMax ?? null
  const paramUnit = points[0]?.unit ?? ""
  const paramTitle = parameterNames[selectedParam] || selectedParam

  if (availableParams.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-sm font-medium">Insufficient Test History</CardTitle>
          <CardDescription>
            Run multiple assessments over time to generate historical trend charts.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Parameter Stability &amp; Trend Over Time
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {paramUnit}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              Tracking longitudinal variations across water sampling dates.
            </CardDescription>
          </div>

          <div className="w-full sm:w-56">
            <Select value={selectedParam} onValueChange={setSelectedParam}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select parameter" />
              </SelectTrigger>
              <SelectContent>
                {availableParams.map((code) => (
                  <SelectItem key={code} value={code} className="text-xs">
                    {parameterNames[code] || code.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2.5 shadow-md text-xs space-y-1">
                        <div className="font-semibold">{data.date}</div>
                        <div className="text-primary font-bold">
                          {paramTitle}: {data.value} {data.unit}
                        </div>
                        {data.limit && (
                          <div className="text-muted-foreground">
                            Guideline Limit: {data.limit} {data.unit}
                          </div>
                        )}
                        <div
                          className={
                            data.status === "elevated"
                              ? "text-red-500 font-medium"
                              : "text-emerald-600 font-medium"
                          }
                        >
                          Status: {data.status}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {referenceLimit !== null && (
                <ReferenceLine
                  y={referenceLimit}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Limit (${referenceLimit})`,
                    fill: "#ef4444",
                    fontSize: 10,
                    position: "top",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2e9990"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#2e9990" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

