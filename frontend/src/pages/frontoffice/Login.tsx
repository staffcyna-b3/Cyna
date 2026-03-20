import { useState } from "react"
import type { FormEvent } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setFrontSession } from "@/lib/frontAuth"
import { login } from "@/services/orderService"

export const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState("blanche.test@dev.local")
  const [password, setPassword] = useState("Test1234!")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectParam = searchParams.get("redirect")
  const redirectFromState = location.state?.redirectTo
  const redirectTo = redirectParam || redirectFromState || "/"

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await login({ email, password })
      const user = response?.user

      if (!user?.id || !user?.email) {
        setError("Invalid login response")
        return
      }

      setFrontSession({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
      })

      localStorage.setItem("frontoffice:checkout:refresh", String(Date.now()))
    } catch (caughtError: unknown) {
      if (typeof caughtError === "object" && caughtError !== null && "message" in caughtError) {
        const message = (caughtError as { message?: unknown }).message
        if (typeof message === "string") {
          setError(message)
        } else {
          setError("Unable to login")
        }
      } else {
        setError("Unable to login")
      }
      return
    } finally {
      setIsSubmitting(false)
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="px-6 py-20 flex justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-md border rounded-lg p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{t("login")}</h1>
        <p className="text-muted-foreground">{t("signInMessage")}</p>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Loading..." : "Continue"}</Button>
      </form>
    </div>
  )
}
