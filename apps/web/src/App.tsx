import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/Auth/Login'
import ProtectedRoute from './components/layouts/ProtectedRoute'
import ProtectedLayout from './components/layouts/ProtectedLayout'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import GatesPage from './pages/Gates/GatesPage'
import UsersPage from './pages/User/UsersPage'
import Visitorpage from './pages/Visitor/Visitorpage'
import PublicVisitorPage from './pages/Public/PublicVisitorPage'
import Properties from './pages/Properties'
import PropertyGuard from './components/layouts/PropertyGuard'

function App() {

  return (
    <>
      <Routes>
        {/* Public Routes  */}
        <Route path='/auth/login' element={<Login />} />
        <Route path='/auth/register' element={<Register />} />
        <Route path='/visitor/:propertyId' element={<PublicVisitorPage />} />

        {/* Private Routes  */}
        <Route element={<ProtectedRoute />} >

          {/* Property Selection Page: Accessible as long as you're logged in */}
          <Route path="/properties" element={<Properties />} />

          {/* Property-Specific Routes: Guarded by Property Selection */}
          <Route element={<PropertyGuard />}>

            <Route element={<ProtectedLayout />} >

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/gates" element={<GatesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/visitors" element={<Visitorpage />} />

            </Route>

          </Route>

        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/properties" replace />} />
      </Routes>

    </>
  )
}

export default App
