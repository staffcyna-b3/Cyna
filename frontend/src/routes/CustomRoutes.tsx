import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/frontoffice/Home"
import { Register } from "../pages/auth/Register"
import { Login } from "@/pages/auth/Login"
import { ConfirmEmail } from "@/pages/auth/ConfirmEmail"
// import { Dashboard } from "@/pages/backoffice/Dashboard"
import { ProtectedRoute } from "@/components/protectedRoute"
import { ResetPassword } from "@/pages/auth/ResetPassword"
import { RequestReset } from "@/pages/auth/RequestReset"
import { Verify2FA } from "@/pages/auth/Verify2FA"
import { UserRole } from "@/types/enums/UserRole.enum"
import CatalogDetail from "../pages/catalog/Detail"
import CatalogList from "../pages/catalog/Index"
import CatalogLayout from "@/layouts/CatalogLayout"
import CartPage from "@/pages/frontoffice/Cart";

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/request-reset" element={<RequestReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-2fa" element={<Verify2FA />} />
      {/* <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]}>
            <Dashboard />
          </ProtectedRoute>
        }
      /> */}

      <Route element={<MainLayout />}>
        <Route element={<CatalogLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogList />} />
          <Route path="/catalog/:id" element={<CatalogDetail />} />
        </Route>
        <Route path="/cart" element={<CartPage />} />
      </Route>
    </Routes>
  )
}