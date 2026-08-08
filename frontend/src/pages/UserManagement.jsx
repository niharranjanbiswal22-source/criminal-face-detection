import React, { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Alert, CircularProgress,
  Stack, Card, CardContent, Badge
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import RefreshIcon from '@mui/icons-material/Refresh'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import api from '../api/axios.js'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch registered users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleStatus = async (user) => {
    setError('')
    setSuccessMsg('')
    try {
      const newStatus = !user.active
      await api.put(`/admin/users/${user.id}/status`, { active: newStatus })
      setSuccessMsg(`User ${user.fullName} (${user.username}) status updated to ${newStatus ? 'ACTIVE (APPROVED)' : 'DEACTIVATED / BANNED'}.`)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return
    setError('')
    setSuccessMsg('')
    try {
      await api.delete(`/admin/users/${selectedUser.id}`)
      setSuccessMsg(`User ${selectedUser.fullName} (${selectedUser.username}) permanently deleted.`)
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.')
    }
  }

  const pendingApprovals = users.filter(u => !u.active && (u.role === 'OFFICER' || u.role === 'ADMIN'))

  return (
    <Box>
      {/* Header Card */}
      <Card elevation={3} sx={{ borderRadius: 3, mb: 3, bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ManageAccountsIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight={800} color="text.primary">
                  User Management & Admin Approvals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approve new Officer/Admin registrations, control user permissions, and deactivate unauthorized accounts.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Refresh List
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Pending Approvals Alert Banner */}
      {pendingApprovals.length > 0 && (
        <Alert
          severity="warning"
          icon={<HowToRegIcon sx={{ fontSize: 26 }} />}
          sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Typography variant="subtitle2" fontWeight={800}>
            ⚠️ {pendingApprovals.length} Pending Registration Approval{pendingApprovals.length > 1 ? 's' : ''}!
          </Typography>
          <Typography variant="body2">
            New Officer or Admin accounts require your approval before they can access the system. Please click <strong>Approve & Activate</strong> below.
          </Typography>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

      {/* User Records Data Table */}
      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#1a237e' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Full Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Email Address / Username</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Requested Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 700 }}>Admin Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1.5 }}>Loading user list...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">No registered users found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isPending = !user.active && (user.role === 'OFFICER' || user.role === 'ADMIN')
                  return (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        bgcolor: isPending ? 'rgba(255, 152, 0, 0.08)' : 'inherit',
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell fontWeight={600}>#{user.id}</TableCell>
                      <TableCell fontWeight={700}>
                        {user.fullName}
                        {isPending && (
                          <Chip label="PENDING APPROVAL" size="small" color="warning" sx={{ ml: 1, fontWeight: 800, fontSize: 10 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{user.email}</Typography>
                        <Typography variant="caption" color="text.secondary">User: {user.username}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'ADMIN' ? 'error' : user.role === 'OFFICER' ? 'warning' : 'primary'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.active ? <CheckCircleIcon /> : <BlockIcon />}
                          label={user.active ? 'ACTIVE' : isPending ? 'PENDING APPROVAL' : 'BANNED'}
                          size="small"
                          color={user.active ? 'success' : isPending ? 'warning' : 'error'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            variant={user.active ? 'outlined' : 'contained'}
                            color={user.active ? 'warning' : 'success'}
                            size="small"
                            startIcon={user.active ? <BlockIcon /> : <HowToRegIcon />}
                            onClick={() => handleToggleStatus(user)}
                            disabled={user.username.toLowerCase() === 'admin'}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                          >
                            {user.active ? 'Ban / Deactivate' : 'Approve & Activate'}
                          </Button>

                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              setSelectedUser(user)
                              setDeleteDialogOpen(true)
                            }}
                            disabled={user.username.toLowerCase() === 'admin'}
                            title="Permanently Delete Account"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm User Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete user account <strong>{selectedUser?.fullName} ({selectedUser?.email})</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Delete User Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
