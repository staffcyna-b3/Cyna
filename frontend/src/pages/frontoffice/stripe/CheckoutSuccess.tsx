import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Stripe may redirect here via return_url after a 3DS/redirect payment method.
// We forward to /checkout/confirmation so all post-payment logic stays in one place.
export const CheckoutSuccess: React.FC = () => {
  const { state } = useLocation();
  return <Navigate to="/checkout/confirmation" state={state} replace />;
};
