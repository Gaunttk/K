import { Routes, Route, Navigate } from 'react-router-dom'
import { getSession } from './lib/auth'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import NewVisitPage from './pages/NewVisitPage'
import VisitDetailPage from './pages/VisitDetailPage'
import AdminPage from './pages/AdminPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = getSession()
  return session ? <>{children}</> : <Navigate to="/" replace />
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const session = getSession()
  if (!session) return <Navigate to="/" replace />
  if (!session.isAdmin) return <Navigate to="/home" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/restaurants/:id" element={<RestaurantPage />} />
        <Route path="/visit/new" element={<NewVisitPage />} />
        <Route path="/visit/:id" element={<VisitDetailPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
