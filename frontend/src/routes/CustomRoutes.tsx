import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/frontoffice/Home"
import BackOfficeLayout from "@/layouts/BackOfficeLayout"
import Dashboard from "../pages/backoffice/Dashboard"
import Users from "@/pages/backoffice/Users"
import { Checkout } from "@/pages/frontoffice/Checkout"
import { CheckoutConfirmation } from "@/pages/frontoffice/CheckoutConfirmation"
import { Login } from "@/pages/frontoffice/Login"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route element={<BackOfficeLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Checkout />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
      </Route>
    </Routes>
  )
}