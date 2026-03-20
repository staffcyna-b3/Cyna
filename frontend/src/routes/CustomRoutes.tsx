import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/Home"
import CatalogDetail from "../pages/catalog/Detail"
import CatalogList from "../pages/catalog/Index"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogList />} />
        <Route path="/catalog/:id" element={<CatalogDetail />} />
      </Route>
    </Routes>
  )
}