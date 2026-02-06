import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/Home"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  )
}