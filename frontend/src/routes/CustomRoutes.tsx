import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/frontOffice/Home"
import { Register } from "../pages/auth/Register"
import { Login } from "@/pages/auth/Login"
import { ConfirmEmail } from "@/pages/auth/ConfirmEmail"
import { ProtectedRoute } from "@/components/protectedRoute"
import { ResetPassword } from "@/pages/auth/ResetPassword"
import { RequestReset } from "@/pages/auth/RequestReset"
import { Verify2FA } from "@/pages/auth/Verify2FA"
import { UserRole } from "@/types/enums/UserRole.enum"
import { CheckoutSuccess } from "@/pages/frontOffice/stripe/CheckoutSuccess"
import { CheckoutCancel } from "@/pages/frontOffice/stripe/CheckoutCancel"
import BackOfficeLayout from "@/layouts/BackOfficeLayout"
import Users from "@/pages/backOffice/Users"
import { Checkout } from "@/pages/frontOffice/Checkout"
import { Checkout as StripeCheckout } from "@/pages/frontOffice/stripe/Checkout"
import { CheckoutConfirmation } from "@/pages/frontOffice/CheckoutConfirmation"
import CatalogDetail from "../pages/catalog/Detail"
import CatalogList from "../pages/catalog/Index"
import CatalogLayout from "@/layouts/CatalogLayout"
import CartPage from "@/pages/frontOffice/Cart";
import Dashboard from "@/pages/backOffice/Dashboard"

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
        <Route element={<CatalogLayout />}>
          <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<Checkout />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
        <Route
          path="/checkout/payment"
          element={
            <ProtectedRoute requiredRoles={[]}>
              <StripeCheckout />
            </ProtectedRoute>
          }
        />
          <Route path="/catalog" element={<CatalogList />} />
          <Route path="/catalog/:id" element={<CatalogDetail />} />
        </Route>
        <Route path="/cart" element={<CartPage />} />
      </Route>
    </Routes>
  )
}