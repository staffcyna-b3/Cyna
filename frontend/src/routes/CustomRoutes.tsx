import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/Home"
import BackOfficeLayout from "../layouts/BackOfficeLayout"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route element={<BackOfficeLayout />}>
        <Route path="/backoffice" element={<HomePage />} />
      </Route>
    </Routes>
  )
}