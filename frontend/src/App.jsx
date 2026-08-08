import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import PersonRegistration from './pages/PersonRegistration.jsx'
import FaceSearch from './pages/FaceSearch.jsx'
import LiveCamera from './pages/LiveCamera.jsx'
import PersonList from './pages/PersonList.jsx'
import MostWanted from './pages/MostWanted.jsx'
import Results from './pages/Results.jsx'
import UserManagement from './pages/UserManagement.jsx'
import Layout from './components/Layout.jsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a237e' },
    secondary: { main: '#00acc1' },
  },
  shape: { borderRadius: 10 },
})

function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function OfficerOrAdminRoute({ children }) {
  const role = localStorage.getItem('role')
  return (role === 'ADMIN' || role === 'OFFICER') ? children : <Navigate to="/search" replace />
}

function AdminRoute({ children }) {
  const role = localStorage.getItem('role')
  return role === 'ADMIN' ? children : <Navigate to="/search" replace />
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/search" replace />} />
                    <Route path="/search" element={<FaceSearch />} />
                    <Route path="/live" element={<LiveCamera />} />
                    <Route path="/most-wanted" element={<MostWanted />} />
                    <Route path="/results" element={<Results />} />
                    
                    {/* Admin Only Routes */}
                    <Route path="/register" element={<AdminRoute><PersonRegistration /></AdminRoute>} />
                    <Route path="/persons" element={<AdminRoute><PersonList /></AdminRoute>} />
                    
                    {/* Admin Only Route */}
                    <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
