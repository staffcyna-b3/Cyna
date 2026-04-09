import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { LanguageProvider } from './providers/LanguageProvider'
import { CheckoutProvider } from './providers/CheckoutProvider'
import CustomRoutes from './routes/CustomRoutes'
import { AuthProvider } from './providers/AuthProvider'
import { StripeProvider } from './context/StripeContext'

function App() {

  return (
    <LanguageProvider>
      <BrowserRouter>
        <StripeProvider>
          <AuthProvider>
            <CustomRoutes />
          </AuthProvider>
        </StripeProvider>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
