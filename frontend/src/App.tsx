import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './providers/LanguageProvider';
import CustomRoutes from './routes/CustomRoutes';
import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <CustomRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
