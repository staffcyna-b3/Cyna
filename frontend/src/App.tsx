import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './providers/LanguageProvider';
import { CheckoutProvider } from './providers/CheckoutProvider'
import CustomRoutes from './routes/CustomRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';
import { Toaster } from 'react-hot-toast';
import { StripeProvider } from './context/StripeContext'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <StripeProvider>
          <AuthProvider>
            <CheckoutProvider>
              <CartProvider>
                <Toaster position="top-right" />
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
