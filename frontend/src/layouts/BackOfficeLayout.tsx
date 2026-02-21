import { Outlet } from "react-router-dom"
import { Nav } from "../components/Backoffice/layout/BackOfficeNav"

export default function MainLayout() {

  return (
    <>
    <Nav/>
     <Outlet />
    </>
  )
}