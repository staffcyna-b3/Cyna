import { Link, Outlet } from "react-router-dom"

export default function MainLayout() {

  return (
    <>
      <div className="flex justify-evenly">
        <h1>Cyna</h1>
        <p>search bar</p>
        <p>language selector</p>
        <Link to="/checkout">cart</Link>
        <p>user profile</p>
      </div>
      <Outlet />
    </>
  )
}