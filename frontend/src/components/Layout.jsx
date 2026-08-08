import React, { useState } from 'react'
import {
  AppBar, Toolbar, Typography, Button, Box, Container, Chip, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Stack, Avatar, Link
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import VideocamIcon from '@mui/icons-material/Videocam'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LogoutIcon from '@mui/icons-material/Logout'
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural'
import LaunchIcon from '@mui/icons-material/Launch'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const navItems = [
    { path: '/search', label: 'Search', icon: <SearchIcon /> },
    { path: '/live', label: 'Live Cam', icon: <VideocamIcon /> },
    { path: '/most-wanted', label: 'Most Wanted', icon: <LocalFireDepartmentIcon /> },
    ...(role === 'ADMIN' ? [
      { path: '/persons', label: 'Registry', icon: <PeopleIcon /> },
      { path: '/register', label: 'Register', icon: <PersonAddIcon /> },
      { path: '/admin/users', label: 'User Control', icon: <ManageAccountsIcon /> },
    ] : []),
  ]

  const navButton = (item) => {
    const isSelected = location.pathname === item.path
    return (
      <Button
        key={item.path}
        size="small"
        startIcon={React.cloneElement(item.icon, { sx: { fontSize: '1rem !important' } })}
        onClick={() => navigate(item.path)}
        sx={{
          px: 1.2,
          py: 0.5,
          fontSize: '0.78rem',
          fontWeight: isSelected ? 800 : 600,
          color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
          bgcolor: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
          borderRadius: 2,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
          border: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.18)',
            color: '#ffffff'
          }
        }}
      >
        {item.label}
      </Button>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={3}
        sx={{
          background: 'linear-gradient(135deg, #0b1021 0%, #151c48 50%, #1a237e 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, md: 2.5 }, minHeight: '58px !important' }}>
          {/* Mobile Hamburger Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo & Title */}
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ flexShrink: 0 }}>
            <Avatar
              src="/project_logo.jpg"
              alt="Criminal Face Detection System Logo"
              sx={{
                width: 38,
                height: 38,
                border: '2px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/search')}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '0.88rem', sm: '1.05rem' },
                  whiteSpace: 'nowrap',
                  lineHeight: 1.1,
                  letterSpacing: 0.2
                }}
              >
                Criminal Face Detection
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  display: 'block'
                }}
              >
                By <strong>Nihar Ranjan Biswal</strong>
              </Typography>
            </Box>
          </Stack>

          {/* Compact Desktop Navigation Bar */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.8 }}>
            {navItems.map(item => navButton(item))}

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', mx: 0.5, height: 20, my: 'auto' }} />

            <Chip
              label={`${username} (${role})`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.72rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                px: 0.5
              }}
            />

            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<LogoutIcon sx={{ fontSize: '0.9rem !important' }} />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                py: 0.4,
                px: 1.4,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.5)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#d32f2f',
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.7)'
                }
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Mobile Role Badge */}
          <Chip
            label={role}
            size="small"
            sx={{ display: { md: 'none' }, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
          />
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260 } }}
      >
        <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src="/project_logo.jpg" sx={{ width: 36, height: 36 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={800}>
                Criminal Detection
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                User: {username} ({role})
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path)
                  setMobileOpen(false)
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#1a237e' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 700 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon color="error"><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error.main', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Responsive Main Content Container */}
      <Container maxWidth="lg" sx={{ mt: { xs: 2.5, sm: 4 }, mb: { xs: 3, sm: 4 }, px: { xs: 1.5, sm: 3 }, flex: 1 }}>
        {children}
      </Container>

      {/* Sleek Compact Single-Line Developer Footer */}
      <Box
        component="footer"
        sx={{
          py: 1.2,
          px: 2,
          bgcolor: '#0d1117',
          color: '#c9d1d9',
          borderTop: '1px solid #21262d',
          mt: 'auto'
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          alignItems="center"
          justifyContent="center"
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar
              src="/developer_nihar.jpg"
              alt="Nihar Ranjan Biswal"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '2px solid #1976d2',
                boxShadow: '0 0 10px rgba(25, 118, 210, 0.4)'
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#8b949e' }}>
              Designed & Engineered by <strong style={{ color: '#f0f6fc' }}>NIHAR RANJAN BISWAL</strong> (Lead AI Architect)
            </Typography>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, borderColor: '#30363d', height: 16, my: 'auto' }} />

          <Link
            href="https://niharbiswal.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              color: '#58a6ff',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { color: '#79c0ff' }
            }}
          >
            Portfolio & Contact <LaunchIcon sx={{ fontSize: 13 }} />
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}
