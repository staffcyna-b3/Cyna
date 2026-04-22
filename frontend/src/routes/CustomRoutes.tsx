import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/frontoffice/Home"
import { Register } from "../pages/auth/Register"
import { Login } from "@/pages/auth/Login"
import { ConfirmEmail } from "@/pages/auth/ConfirmEmail"
import Dashboard from "@/pages/backoffice/Dashboard"
import { ResetPassword } from "@/pages/auth/ResetPassword"
import { RequestReset } from "@/pages/auth/RequestReset"
import { Verify2FA } from "@/pages/auth/Verify2FA"
import { UserRole } from "@/types/enums/UserRole.enum"
import BackOfficeLayout from "@/layouts/BackOfficeLayout"
import Users from "@/pages/backoffice/Users"
import { CheckoutSuccess } from "@/pages/frontoffice/stripe/CheckoutSuccess"
import { CheckoutCancel } from "@/pages/frontoffice/stripe/CheckoutCancel"
import { Checkout as StripeCheckout } from "@/pages/frontoffice/stripe/Checkout"
import { CheckoutConfirmation } from "@/pages/frontoffice/CheckoutConfirmation"
import CatalogDetail from "@/pages/frontoffice/catalog/Detail"
import CatalogList from "@/pages/frontoffice/catalog/Index"
import CatalogLayout from "@/layouts/CatalogLayout"
import { Cart } from "@/pages/frontoffice/Cart"
import { ProtectedRoute } from "@/components/protectedRoute"
import Orders from "@/pages/backoffice/Orders"
import Transactions from "@/pages/backoffice/Transactions"
import Refunds from "@/pages/backoffice/Refunds"

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

      {/* Backoffice routes */}
      <Route element={<BackOfficeLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/refunds" element={<Refunds />} />
      </Route>

      {/* Frontoffice routes */}
      <Route element={<MainLayout />}>
        <Route element={<CatalogLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogList />} />
          <Route path="/catalog/:id" element={<CatalogDetail />} />
        </Route>
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
        <Route
          path="/checkout/payment"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <StripeCheckout />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}