import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { LanguageProvider } from './providers/LanguageProvider'
import { CheckoutProvider } from './providers/CheckoutProvider'
import CustomRoutes from './routes/CustomRoutes'

function App() {

  return (
    <LanguageProvider>
      <CheckoutProvider>
        <BrowserRouter>
          <CustomRoutes />
        </BrowserRouter>
      </CheckoutProvider>
    </LanguageProvider>
  )
}

export default App
