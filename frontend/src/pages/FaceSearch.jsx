import React, { useState } from 'react'
import { Paper, Typography, Button, Box, Avatar, Alert, Stack, CircularProgress } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SearchIcon from '@mui/icons-material/Search'
import VideocamIcon from '@mui/icons-material/Videocam'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

export default function FaceSearch() {
  const navigate = useNavigate()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
    setError(null)
  }

  const handleSearch = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', image)
      const { data } = await api.post('/recognition/search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/results', { state: { result: data, queryImage: preview } })
    } catch (err) {
      setError(err.response?.data?.message || 'Face search failed. Try a clearer photo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Face Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a photo or use live camera to search against registered persons.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<VideocamIcon />}
          onClick={() => navigate('/live')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Use Live Camera
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      <Stack spacing={3} alignItems="center" sx={{ mt: 3 }}>
        <Avatar src={preview} variant="rounded" sx={{ width: 180, height: 180, bgcolor: '#e0e0e0' }} />

        <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
          Choose Photo
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
          disabled={!image || loading}
          onClick={handleSearch}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </Stack>
    </Paper>
  )
}
