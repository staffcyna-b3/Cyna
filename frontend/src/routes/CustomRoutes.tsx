import { Routes, Route, useLocation } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/frontoffice/Home"
import { Register } from "../pages/auth/Register"
import { Login } from "@/pages/auth/Login"
import { ConfirmEmail } from "@/pages/auth/ConfirmEmail"
import Dashboard from "@/pages/backoffice/Dashboard"
import { ResetPassword } from "@/pages/auth/ResetPassword"
import { RequestReset } from "@/pages/auth/RequestReset"
import { Verify2FA } from "@/pages/auth/Verify2FA"
import { UnauthorizedPage } from "@/pages/auth/UnauthorizedPage"
import { UserRole } from "@/types/enums/UserRole.enum"
import BackOfficeLayout from "@/layouts/BackOfficeLayout"
import Users from "@/pages/backoffice/Users"
import Products from "@/pages/backoffice/Products"
import Categories from "@/pages/backoffice/Categories"
import Orders from "@/pages/backoffice/Orders"
import Transactions from "@/pages/backoffice/Transactions"
import Refunds from "@/pages/backoffice/Refunds"
import Discounts from "@/pages/backoffice/Discounts"
import { CheckoutSuccess } from "@/pages/frontoffice/stripe/CheckoutSuccess"
import { CheckoutCancel } from "@/pages/frontoffice/stripe/CheckoutCancel"
import { Checkout as StripeCheckout } from "@/pages/frontoffice/stripe/Checkout"
import { CheckoutConfirmation } from "@/pages/frontoffice/CheckoutConfirmation"
import CatalogDetail from "@/pages/frontoffice/catalog/Detail"
import CatalogList from "@/pages/frontoffice/catalog/Index"
import CatalogLayout from "@/layouts/CatalogLayout"
import { Cart } from "@/pages/frontoffice/Cart"
import AccountPage from "@/pages/frontoffice/AccountPage"
import OrdersPage from "@/pages/frontoffice/OrdersPage"
import { ProtectedRoute } from "@/components/protectedRoute"
import Contact from "@/pages/frontoffice/Contact"
import MySubscriptions from "@/pages/frontoffice/MySubscriptions"
import Support from "@/pages/backoffice/Support"

export default function CustomRoutes() {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      {/* Auth routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/request-reset" element={<RequestReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-2fa" element={<Verify2FA />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Backoffice routes */}
      <Route element={<BackOfficeLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL]}>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <Users />
            </ProtectedRoute>
          }
        />
        
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <Orders />
              </ProtectedRoute>
            } 
          />  
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/refunds"
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <Refunds />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/discounts"
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <Discounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <Support />
              </ProtectedRoute>
            }
          />
      </Route>

      {/* Frontoffice routes */}
      <Route element={<MainLayout />}>
        <Route element={<CatalogLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogList />} />
          <Route path="/catalog/:slug" element={<CatalogDetail />} />
        </Route>
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mon-compte/abonnements"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <MySubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <CheckoutSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/cancel"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <CheckoutCancel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/confirmation"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <CheckoutConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/payment"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.COMMERCIAL, UserRole.USER]}>
              <StripeCheckout />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}