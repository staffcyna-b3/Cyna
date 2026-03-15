import { Outlet } from "react-router-dom"

export default function MainLayout() {

  return (
    <>
      <div className="flex justify-evenly">
        <h1>Cyna</h1>
        <p>search bar</p>
        <p>language selector</p>
        <p>cart</p>
        <p>user profile</p>
      </div>
      <Outlet />
    </>
  )
}