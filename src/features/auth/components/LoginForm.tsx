"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Sparkles, KeyRound } from "lucide-react"
import { signInAction } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("password", values.password)

    const result = await signInAction(formData)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success("Welcome back!")
    router.push("/dashboard")
    router.refresh()
  }

  async function handleDemoLogin() {
    setIsDemoLoading(true)
    setValue("email", "demo@aquaveris.ai")
    setValue("password", "Demo@123456")

    const formData = new FormData()
    formData.append("email", "demo@aquaveris.ai")
    formData.append("password", "Demo@123456")

    const result = await signInAction(formData)

    if (result.error) {
      toast.error(result.error)
      setIsDemoLoading(false)
      return
    }

    toast.success("Signed in with Demo Account!")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Card className="border-sky-200/80 shadow-lg shadow-sky-500/5">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sign in</CardTitle>
        <CardDescription>Enter your email and password to access your dashboard</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Quick Demo Access banner */}
          <div className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-sky-50/60 p-3.5 space-y-2 dark:border-sky-900/60 dark:from-slate-900 dark:to-sky-950/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" /> Demo Account Ready
              </span>
              <span className="text-[11px] text-slate-500 font-mono dark:text-slate-400">
                demo@aquaveris.ai
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoLogin}
              disabled={isDemoLoading || isLoading}
              className="w-full h-8 text-xs font-semibold border-sky-300 bg-white text-sky-700 hover:bg-sky-100/70 hover:text-sky-800 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-300"
            >
              {isDemoLoading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <KeyRound className="mr-1.5 h-3.5 w-3.5 text-sky-600" />
              )}
              One-Click Demo Login
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full font-semibold" disabled={isLoading || isDemoLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sky-600 hover:underline font-semibold dark:text-sky-400">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
