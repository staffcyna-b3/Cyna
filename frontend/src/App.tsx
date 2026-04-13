import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './providers/LanguageProvider';
import { CheckoutProvider } from './providers/CheckoutProvider'
import CustomRoutes from './routes/CustomRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';
import { Toaster } from '@/components/ui/sonner';
import { StripeProvider } from './context/StripeContext'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <StripeProvider>
          <AuthProvider>
            <CheckoutProvider>
              <CartProvider>
                <Toaster position="top-center" richColors />
                <CustomRoutes />
              </CartProvider>
            </CheckoutProvider>
          </AuthProvider>
        </StripeProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
