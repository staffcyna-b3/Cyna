import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/Home"
import { Register } from "../pages/auth/Register"
import { Login } from "@/pages/auth/Login"
import { ConfirmEmail } from "@/pages/auth/ConfirmEmail"
import { Dashboard } from "@/pages/Dashboard"
import { ProtectedRoute } from "@/components/protectedRoute"
import { ResetPassword } from "@/pages/auth/ResetPassword"
import { RequestReset } from "@/pages/auth/RequestReset"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/request-reset" element={<RequestReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  )
}