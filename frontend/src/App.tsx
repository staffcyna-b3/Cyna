import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './providers/LanguageProvider';
import CustomRoutes from './routes/CustomRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <CustomRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
