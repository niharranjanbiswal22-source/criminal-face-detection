import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Paper, Typography, Box, Avatar, Chip, Button, Divider, Grid,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')

const strengthColor = {
  HIGH_CONFIDENCE: 'success',
  STRONG_MATCH: 'primary',
  POSSIBLE_MATCH: 'warning',
  NO_MATCH: 'default',
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.result) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography>No search result to display.</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/search')}>
          Go to Face Search
        </Button>
      </Paper>
    )
  }

  const { result, queryImage } = state
  const confidencePct = (result.confidence * 100).toFixed(2)

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Search Results
      </Typography>

      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Uploaded Photo
          </Typography>
          <Avatar src={queryImage} variant="rounded" sx={{ width: 200, height: 200 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Matched Registered Photo
          </Typography>
          <Avatar
            src={result.matchFound ? `${API_ORIGIN}${result.registeredPhotoPath}` : undefined}
            variant="rounded"
            sx={{ width: 200, height: 200, bgcolor: '#eee' }}
          >
            {!result.matchFound && <CancelIcon sx={{ fontSize: 48, color: 'grey.500' }} />}
          </Avatar>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {result.matchFound ? (
          <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
        ) : (
          <CancelIcon color="error" sx={{ fontSize: 32 }} />
        )}
        <Typography variant="h6">
          {result.matchFound ? 'Match Found' : 'No Match Found'}
        </Typography>
        <Chip
          label={result.matchStrength.replaceAll('_', ' ')}
          color={strengthColor[result.matchStrength] || 'default'}
        />
      </Box>

      {result.matchFound && (
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography color="text.secondary">Person Name</Typography></Grid>
          <Grid item xs={6}><Typography fontWeight={600}>{result.personName}</Typography></Grid>

          <Grid item xs={6}><Typography color="text.secondary">Person ID</Typography></Grid>
          <Grid item xs={6}><Typography fontWeight={600}>{result.personCode}</Typography></Grid>

          <Grid item xs={6}><Typography color="text.secondary">Match Confidence</Typography></Grid>
          <Grid item xs={6}><Typography fontWeight={600}>{confidencePct}%</Typography></Grid>
        </Grid>
      )}

      <Button sx={{ mt: 4 }} variant="outlined" onClick={() => navigate('/search')}>
        Search Again
      </Button>
    </Paper>
  )
}
