import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { LanguageProvider } from './providers/LanguageProvider'
import CustomRoutes from './routes/CustomRoutes'

function App() {

  return (
    <LanguageProvider>
      <BrowserRouter>
        <CustomRoutes />
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
