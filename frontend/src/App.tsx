import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { LanguageProvider } from './providers/LanguageProvider'
import CustomRoutes from './routes/CustomRoutes'
import { AuthProvider } from './providers/AuthProvider'

function App() {

  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <CustomRoutes />
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
