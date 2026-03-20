import { FormEvent } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { setFrontAuthenticated, setFrontUserProfile } from "@/lib/frontAuth"

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const redirectParam = searchParams.get("redirect")
  const redirectFromState = location.state?.redirectTo
  const redirectTo = redirectParam || redirectFromState || "/"

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFrontAuthenticated(true)
    setFrontUserProfile({
      fullName: "Jean Dupont",
      address: "12 Rue de la Paix",
      city: "Paris",
      postalCode: "75002"
    })
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="px-6 py-20 flex justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-md border rounded-lg p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Login (Mock)</h1>
        <p className="text-muted-foreground">This page is only for testing checkout workflow.</p>
        <Button type="submit">Continue</Button>
      </form>
    </div>
  )
}
