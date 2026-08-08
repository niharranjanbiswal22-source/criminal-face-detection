import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, TextField, Button, Typography, Alert, InputAdornment,
  Tabs, Tab, Chip, Stack, Divider, Avatar
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import BadgeIcon from '@mui/icons-material/Badge'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import api from '../api/axios.js'

export default function Login() {
  const navigate = useNavigate()
  const [loginMode, setLoginMode] = useState(0) // 0 = User (Default), 1 = Admin, 2 = Officer
  const [username, setUsername] = useState('user')
  const [password, setPassword] = useState('User@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleModeChange = (event, newMode) => {
    setLoginMode(newMode)
    setError('')
    if (newMode === 0) {
      setUsername('user')
      setPassword('User@123')
    } else if (newMode === 1) {
      setUsername('admin')
      setPassword('Admin@123')
    } else {
      setUsername('officer1')
      setPassword('Officer@123')
    }
  }

  const handleQuickFill = (roleName) => {
    setError('')
    if (roleName === 'USER') {
      setLoginMode(0)
      setUsername('user')
      setPassword('User@123')
    } else if (roleName === 'ADMIN') {
      setLoginMode(1)
      setUsername('admin')
      setPassword('Admin@123')
    } else if (roleName === 'OFFICER') {
      setLoginMode(2)
      setUsername('officer1')
      setPassword('Officer@123')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('role', data.role)
      navigate('/search')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #00acc1 100%)',
      }}
    >
      <Paper elevation={6} sx={{ p: 4.5, width: 440, maxWidth: '92vw', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5 }}>
          <Avatar
            src="/project_logo.jpg"
            alt="Criminal Face Detection System Logo"
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '3px solid #1976d2',
              boxShadow: '0 0 20px rgba(25, 118, 210, 0.4)',
              mb: 1.5
            }}
          />
          <Typography variant="h5" fontWeight={700}>Sign In</Typography>
          <Typography variant="subtitle1" fontWeight={800} color="primary" align="center" sx={{ mt: 0.5, lineHeight: 1.2 }}>
            Criminal Face Detection & Surveillance System
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
            Engineered by <strong>Nihar Ranjan Biswal</strong>
          </Typography>
        </Box>

        {/* User (Default) / Admin / Officer Role Mode Tabs */}
        <Box sx={{ mb: 2.5, bgcolor: '#f0f2f5', borderRadius: 2, p: 0.5 }}>
          <Tabs
            value={loginMode}
            onChange={handleModeChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<BadgeIcon />}
              iconPosition="start"
              label="User"
              sx={{ fontWeight: 600, fontSize: '0.8rem' }}
            />
            <Tab
              icon={<AdminPanelSettingsIcon />}
              iconPosition="start"
              label="Admin"
              sx={{ fontWeight: 600, fontSize: '0.8rem' }}
            />
            <Tab
              icon={<LocalPoliceIcon />}
              iconPosition="start"
              label="Officer"
              sx={{ fontWeight: 600, fontSize: '0.8rem' }}
            />
          </Tabs>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
            }}
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
            }}
            required
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.3, fontWeight: 700, borderRadius: 2 }}
          >
            {loading ? 'Signing in…' : loginMode === 0 ? 'LOGIN AS USER' : loginMode === 1 ? 'LOGIN AS ADMIN' : 'LOGIN AS OFFICER'}
          </Button>
        </form>

        <Divider sx={{ my: 2.5 }}>
          <Typography variant="caption" color="text.secondary">
            DEMO LOGIN QUICK ACCESS
          </Typography>
        </Divider>

        {/* Quick Demo Autofill Chips */}
        <Stack direction="row" spacing={1} justifyContent="center">
          <Chip
            avatar={<BadgeIcon />}
            label="User (user)"
            color={loginMode === 0 ? 'primary' : 'default'}
            onClick={() => handleQuickFill('USER')}
            clickable
            size="small"
          />
          <Chip
            avatar={<AdminPanelSettingsIcon />}
            label="Admin (admin)"
            color={loginMode === 1 ? 'primary' : 'default'}
            onClick={() => handleQuickFill('ADMIN')}
            clickable
            size="small"
          />
          <Chip
            avatar={<LocalPoliceIcon />}
            label="Officer (officer1)"
            color={loginMode === 2 ? 'primary' : 'default'}
            onClick={() => handleQuickFill('OFFICER')}
            clickable
            size="small"
          />
        </Stack>

        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2.5, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">Need a new account?</Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            color="primary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate('/signup')}
          >
            Create Account / Sign Up
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
