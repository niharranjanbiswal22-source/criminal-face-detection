import React, { useState, useEffect } from 'react'
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Button, IconButton, Chip, Box, Stack, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress, Card, CardContent
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PeopleIcon from '@mui/icons-material/People'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')

export default function PersonList() {
  const navigate = useNavigate()
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Edit Modal State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editPerson, setEditPerson] = useState(null)
  const [editCode, setEditCode] = useState('')
  const [editName, setEditName] = useState('')
  const [editImage, setEditImage] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  // Delete Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [personToDelete, setPersonToDelete] = useState(null)

  const fetchPersons = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/persons')
      setPersons(data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch registered criminals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersons()
  }, [])

  // Open Edit Dialog
  const handleOpenEdit = (person) => {
    setEditPerson(person)
    setEditCode(person.personCode)
    setEditName(person.fullName)
    setEditImage(null)
    setEditPreview(`${API_ORIGIN}${person.imagePath}`)
    setEditDialogOpen(true)
  }

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!editPerson) return
    setEditLoading(true)
    try {
      const formData = new FormData()
      formData.append('personCode', editCode)
      formData.append('fullName', editName)
      if (editImage) {
        formData.append('image', editImage)
      }

      await api.put(`/persons/${editPerson.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccessMsg(`Criminal '${editName}' updated successfully.`)
      setEditDialogOpen(false)
      fetchPersons()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update criminal details.')
    } finally {
      setEditLoading(false)
    }
  }

  // Open Delete Dialog
  const handleOpenDelete = (person) => {
    setPersonToDelete(person)
    setDeleteDialogOpen(true)
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!personToDelete) return
    try {
      await api.delete(`/persons/${personToDelete.id}`)
      setSuccessMsg(`Criminal '${personToDelete.fullName}' deleted from registry.`)
      setDeleteDialogOpen(false)
      fetchPersons()
    } catch (err) {
      setError('Failed to delete criminal record.')
    }
  }

  const filteredPersons = persons.filter(p =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.personCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            📜 Criminal Registry Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, edit, or remove registered criminal face profiles in the database.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/register')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Register New Person
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

      {/* Summary Card & Search Bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ width: { xs: '100%', sm: 220 }, bgcolor: '#e8eaf6' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PeopleIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOTAL REGISTERED
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {persons.length} Members
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <TextField
          fullWidth
          placeholder="Search by Name or Person ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
          size="small"
        />
      </Stack>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredPersons.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No registered criminal records found. Click 'Register New Person' to add records.
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell fontWeight={700}>Face Photo</TableCell>
                <TableCell fontWeight={700}>Person ID</TableCell>
                <TableCell fontWeight={700}>Full Name</TableCell>
                <TableCell fontWeight={700}>Registration Date & Time</TableCell>
                <TableCell fontWeight={700} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPersons.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Avatar
                      src={`${API_ORIGIN}${p.imagePath}`}
                      variant="rounded"
                      sx={{ width: 54, height: 54 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={p.personCode} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{p.fullName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenEdit(p)} title="Edit Record">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDelete(p)} title="Delete Record">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Modal Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>✏️ Edit Criminal Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Person ID / Code"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Full Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              fullWidth
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={editPreview} variant="rounded" sx={{ width: 72, height: 72 }} />
              <Button component="label" variant="outlined" size="small" startIcon={<CloudUploadIcon />}>
                Update Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setEditImage(file)
                      setEditPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={editLoading}>
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle fontWeight={700}>⚠️ Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete criminal record <strong>{personToDelete?.fullName}</strong> (ID: {personToDelete?.personCode})?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action will remove all face embeddings and photos permanently.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
