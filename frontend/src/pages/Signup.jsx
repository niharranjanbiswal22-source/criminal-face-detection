import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Paper, TextField, Button, Typography, Alert, InputAdornment,
  Avatar, Link, Stack, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import BadgeIcon from '@mui/icons-material/Badge'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import api from '../api/axios.js'

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER') // USER, OFFICER, ADMIN
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingApprovalMsg, setPendingApprovalMsg] = useState('')
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { fullName, email, password, role })
      
      if (data.pendingApproval) {
        setPendingApprovalMsg(data.message || 'Registration submitted! Officer/Admin accounts require Admin Approval before login.')
        setSuccessDialogOpen(true)
      } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.username)
        localStorage.setItem('role', data.role)
        navigate('/search')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Email may already be registered.')
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
        py: 4
      }}
    >
      <Paper elevation={6} sx={{ p: 4.5, width: 460, maxWidth: '92vw', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5 }}>
          <Avatar
            src="/project_logo.jpg"
            alt="Criminal Face Detection System Logo"
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              border: '3px solid #1976d2',
              boxShadow: '0 0 20px rgba(25, 118, 210, 0.4)',
              mb: 1.5
            }}
          />
          <Typography variant="h5" fontWeight={700}>Create New Account</Typography>
          <Typography variant="subtitle1" fontWeight={800} color="primary" align="center" sx={{ mt: 0.5, lineHeight: 1.2 }}>
            Criminal Face Detection System
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
            }}
            placeholder="e.g. Nihar Ranjan Biswal"
            required
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
            }}
            placeholder="name@example.com"
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
            helperText="Minimum 6 characters"
            required
          />

          <FormControl component="fieldset" sx={{ mt: 2, mb: 1, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Requested System Role:</FormLabel>
            <RadioGroup
              row
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ justifyContent: 'space-between', mt: 0.5 }}
            >
              <FormControlLabel value="USER" control={<Radio size="small" />} label="User" />
              <FormControlLabel value="OFFICER" control={<Radio size="small" />} label="Officer" />
              <FormControlLabel value="ADMIN" control={<Radio size="small" />} label="Admin" />
            </RadioGroup>
          </FormControl>

          {(role === 'OFFICER' || role === 'ADMIN') && (
            <Alert severity="info" sx={{ my: 1.5, fontSize: '0.78rem' }}>
              <strong>Admin Approval Required:</strong> {role} registrations require manual approval by System Admin before you can log in.
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<PersonAddIcon />}
            sx={{ mt: 2.5, mb: 2, py: 1.2, fontWeight: 700, borderRadius: 2 }}
          >
            {loading ? 'Submitting Registration...' : 'Sign Up & Register'}
          </Button>
        </form>

        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">Already have an account?</Typography>
          <Link component={RouterLink} to="/login" variant="body2" fontWeight={700} underline="hover">
            Sign In Here
          </Link>
        </Stack>

        {/* Pending Admin Approval Dialog */}
        <Dialog open={successDialogOpen} onClose={() => navigate('/login')}>
          <DialogTitle sx={{ fontWeight: 800, color: 'primary.main' }}>
            Registration Submitted!
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.primary', mt: 1 }}>
              {pendingApprovalMsg}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
              Go to Sign In
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  )
}
