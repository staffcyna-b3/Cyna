import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/frontoffice/Home"
import { Register } from "../pages/auth/Register"
import { Login } from "@/pages/auth/Login"
import { ConfirmEmail } from "@/pages/auth/ConfirmEmail"
import { Dashboard } from "@/pages/backoffice/Dashboard"
import { ProtectedRoute } from "@/components/protectedRoute"
import { ResetPassword } from "@/pages/auth/ResetPassword"
import { RequestReset } from "@/pages/auth/RequestReset"
import { Verify2FA } from "@/pages/auth/Verify2FA"
import { UserRole } from "@/types/enums/UserRole.enum"
import { CheckoutSuccess } from "@/pages/CheckoutSuccess"
import { CheckoutCancel } from "@/pages/CheckoutCancel"
import BackOfficeLayout from "@/layouts/BackOfficeLayout"
import Users from "@/pages/backoffice/Users"
import { Checkout } from "@/pages/frontoffice/Checkout"
import { CheckoutConfirmation } from "@/pages/frontoffice/CheckoutConfirmation"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      {/* Auth routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/request-reset" element={<RequestReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-2fa" element={<Verify2FA />} />

      {/* Backoffice routes — protected by role */}
      <Route
        element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]}>
            <BackOfficeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
      </Route>

      {/* Frontoffice routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<Checkout />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
      </Route>
    </Routes>
  )
}