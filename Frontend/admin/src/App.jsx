import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AdminProvider } from './contexts/AdminContext'
import AdminRoutes from './routes/adminRoutes'

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AdminRoutes />
      </AdminProvider>
    </BrowserRouter>
  )
}

export default App
