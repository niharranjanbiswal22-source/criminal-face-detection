import React, { useState, useEffect } from 'react'
import {
  Paper, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, Chip, Box, Stack, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress,
  IconButton
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/images/')) return `${API_ORIGIN}${path}`
  if (path.startsWith('/')) return `${API_ORIGIN}/images${path}`
  return `${API_ORIGIN}/images/${path}`
}

const dangerColor = {
  CRITICAL: 'error',
  EXTREME: 'warning',
  HIGH: 'primary',
}

export default function MostWanted() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')
  const isAdmin = role === 'ADMIN' || role === 'OFFICER'

  const [wantedList, setWantedList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [personCode, setPersonCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [crimeDescription, setCrimeDescription] = useState('')
  const [rewardAmount, setRewardAmount] = useState('')
  const [dangerLevel, setDangerLevel] = useState('CRITICAL')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const fetchMostWanted = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/most-wanted')
      setWantedList(data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch Most Wanted criminal notices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMostWanted()
  }, [])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setPersonCode('')
    setFullName('')
    setTitle('WANTED FOR ARMED ROBBERY & FUGITIVE OFFENSES')
    setCrimeDescription('Active arrest warrant issued. Approach with extreme caution.')
    setRewardAmount('$50,000')
    setDangerLevel('CRITICAL')
    setImage(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setPersonCode(item.personCode)
    setFullName(item.fullName)
    setTitle(item.title)
    setCrimeDescription(item.crimeDescription || '')
    setRewardAmount(item.rewardAmount || '')
    setDangerLevel(item.dangerLevel || 'CRITICAL')
    setImage(null)
    setImagePreview(getImageUrl(item.imagePath))
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSubmitLoading(true)
    try {
      const formData = new FormData()
      formData.append('personCode', personCode)
      formData.append('fullName', fullName)
      formData.append('title', title)
      formData.append('crimeDescription', crimeDescription)
      formData.append('rewardAmount', rewardAmount)
      formData.append('dangerLevel', dangerLevel)
      if (image) {
        formData.append('image', image)
      }

      if (editingItem) {
        await api.put(`/most-wanted/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccessMsg(`Most Wanted record for '${fullName}' updated successfully.`)
      } else {
        if (!image) {
          setError('A criminal photo is required to add Most Wanted notice.')
          setSubmitLoading(false)
          return
        }
        await api.post('/most-wanted', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccessMsg(`Most Wanted record for '${fullName}' published successfully.`)
      }

      setDialogOpen(false)
      fetchMostWanted()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Most Wanted record.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await api.delete(`/most-wanted/${itemToDelete.id}`)
      setSuccessMsg(`Most Wanted record '${itemToDelete.fullName}' deleted.`)
      setDeleteDialogOpen(false)
      fetchMostWanted()
    } catch (err) {
      setError('Failed to delete Most Wanted record.')
    }
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 4 } }}>
      {/* Header Banner */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #b71c1c 0%, #880e4f 100%)',
          color: 'white',
          boxShadow: 3
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <WarningIcon sx={{ fontSize: { xs: 26, sm: 32 }, color: '#ffeb3b' }} />
              <Typography variant="h5" fontWeight={800} letterSpacing={0.5} sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                MOST WANTED CRIMINALS & FUGITIVES
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Official High-Priority Wanted Notices. Perform live camera detection or photo search to identify suspects.
            </Typography>
          </Box>

          {isAdmin && (
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: '#b71c1c',
                fontWeight: 700,
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { bgcolor: '#ffebee' }
              }}
              startIcon={<AddCircleIcon />}
              onClick={handleOpenAdd}
            >
              Add Most Wanted
            </Button>
          )}
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}

      {/* Grid of Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : wantedList.length === 0 ? (
        <Alert severity="info">
          No Most Wanted notices currently posted. {isAdmin && 'Click "Add Most Wanted" above to publish a notice.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {wantedList.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  borderColor: item.dangerLevel === 'CRITICAL' ? '#f44336' : '#e0e0e0',
                  boxShadow: item.dangerLevel === 'CRITICAL' ? 3 : 1
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={getImageUrl(item.imagePath)}
                    alt={item.fullName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Chip
                    label={item.dangerLevel || 'HIGH DANGER'}
                    color={dangerColor[item.dangerLevel] || 'error'}
                    size="small"
                    sx={{ position: 'absolute', top: 10, left: 10, fontWeight: 700 }}
                  />
                  {item.rewardAmount && (
                    <Chip
                      icon={<AttachMoneyIcon />}
                      label={`REWARD: ${item.rewardAmount}`}
                      sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(0,0,0,0.85)', color: '#ffee58', fontWeight: 700 }}
                      size="small"
                    />
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    ID: {item.personCode}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main" gutterBottom>
                    {item.fullName}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.crimeDescription || 'Wanted in connection with serious criminal investigations.'}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, justifyContent: 'space-between', bgcolor: '#fafafa' }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={() => navigate('/live')}
                  >
                    Scan Live
                  </Button>

                  {isAdmin && (
                    <Box>
                      <IconButton color="primary" onClick={() => handleOpenEdit(item)} title="Edit Notice">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => { setItemToDelete(item); setDeleteDialogOpen(true); }} title="Delete Notice">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Admin Add/Edit Modal */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {editingItem ? '✏️ Edit Most Wanted Notice' : '🚨 Publish Most Wanted Notice'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Person ID / Warrant Code"
              value={personCode}
              onChange={(e) => setPersonCode(e.target.value)}
              placeholder="e.g. WANTED_9556645"
              required
              fullWidth
            />
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Nihar Ranjan Biswal"
              required
              fullWidth
            />
            <TextField
              label="Wanted Title / Offenses"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ARMED ROBBERY & CYBER FUGITIVE"
              required
              fullWidth
            />
            <TextField
              label="Reward Amount"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="e.g. $50,000 USD"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Threat / Danger Level</InputLabel>
              <Select
                value={dangerLevel}
                label="Threat / Danger Level"
                onChange={(e) => setDangerLevel(e.target.value)}
              >
                <MenuItem value="CRITICAL">🔴 CRITICAL THREAT</MenuItem>
                <MenuItem value="EXTREME">🟠 EXTREME DANGER</MenuItem>
                <MenuItem value="HIGH">🔵 HIGH PRIORITY</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Crime Details & Case Description"
              value={crimeDescription}
              onChange={(e) => setCrimeDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }}
                />
              )}
              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                Upload Wanted Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setImage(file)
                      setImagePreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleSave} disabled={submitLoading}>
            {submitLoading ? 'Publishing...' : 'Publish Notice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle fontWeight={700}>⚠️ Confirm Delete Most Wanted Notice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{itemToDelete?.fullName}</strong> from the Most Wanted registry?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete Notice
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
