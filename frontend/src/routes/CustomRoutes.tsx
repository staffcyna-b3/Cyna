import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/Home"
import BackOfficeLayout from "@/layouts/BackOfficeLayout"
import Dashboard from "../pages/BackOffice/Dashboard"
import Users from "@/pages/BackOffice/Users"
import { Checkout } from "@/pages/Checkout"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      // add check user role here to display backoffice routes only for admin
      <Route element={<BackOfficeLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
    </Routes>
  )
}