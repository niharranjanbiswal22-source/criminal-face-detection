import React, { useState, useRef, useEffect } from 'react'
import {
  Paper, Typography, Button, Box, Alert, Stack, CircularProgress,
  Chip, Card, Grid, Switch, FormControlLabel, Select, MenuItem
} from '@mui/material'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CameraIcon from '@mui/icons-material/Camera'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import api from '../api/axios.js'

export default function LiveCamera() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [autoScan, setAutoScan] = useState(true)
  const [scanInterval, setScanInterval] = useState(1000)
  const [scanning, setScanning] = useState(false)
  const [latestResult, setLatestResult] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  // Start Webcam Stream
  const startCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsStreaming(true)
    } catch (err) {
      console.error(err)
      setError('Unable to access webcam. Please check camera permissions in your browser.')
    }
  }

  // Stop Webcam Stream
  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
    setLatestResult(null)
    clearCanvas()
  }

  // Clear Canvas Overlay
  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  // Capture frame & call backend search API
  const captureAndSearch = async () => {
    if (!videoRef.current || !isStreaming || scanning) return
    const video = videoRef.current
    if (video.readyState !== 4) return

    setScanning(true)
    try {
      const captureCanvas = document.createElement('canvas')
      captureCanvas.width = video.videoWidth || 640
      captureCanvas.height = video.videoHeight || 480
      const ctx = captureCanvas.getContext('2d')
      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height)

      captureCanvas.toBlob(async (blob) => {
        if (!blob) {
          setScanning(false)
          return
        }
        const formData = new FormData()
        formData.append('image', blob, 'webcam_frame.jpg')

        try {
          const { data } = await api.post('/recognition/search', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          setLatestResult(data)
          drawBoundingBox(data, captureCanvas.width, captureCanvas.height)
        } catch (err) {
          console.error('Frame recognition error:', err)
        } finally {
          setScanning(false)
        }
      }, 'image/jpeg', 0.85)
    } catch (e) {
      console.error(e)
      setScanning(false)
    }
  }

  // Draw Bounding Box & Target Overlay over Video Canvas
  const drawBoundingBox = (result, streamW, streamH) => {
    if (!canvasRef.current || !videoRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.clientWidth || streamW
    canvas.height = videoRef.current.clientHeight || streamH
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Only draw box when a match is found
    if (!result || !result.boundingBox || !result.matchFound) return

    const box = result.boundingBox
    const scaleX = canvas.width / streamW
    const scaleY = canvas.height / streamH

    const x = box.x * scaleX
    const y = box.y * scaleY
    const w = box.width * scaleX
    const h = box.height * scaleY

    const color = result.matchStrength === 'HIGH_CONFIDENCE' ? '#4caf50' : '#ff9800'
    const label = `MATCH: ${result.personName} (${(result.confidence * 100).toFixed(1)}%)`

    // Target Box Border
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, w, h)

    // Corner Target Highlights
    const cornerLen = 16
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    // Top-Left
    ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke()
    // Top-Right
    ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLen); ctx.stroke()
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(x, y + h - cornerLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerLen, y + h); ctx.stroke()
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerLen); ctx.stroke()

    // Draw Label Badge
    ctx.fillStyle = color
    ctx.font = 'bold 14px Roboto, sans-serif'
    const textWidth = ctx.measureText(label).width
    ctx.fillRect(x, y > 25 ? y - 25 : y, textWidth + 16, 24)

    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, x + 8, (y > 25 ? y - 25 : y) + 17)
  }

  // Auto scan interval effect
  useEffect(() => {
    if (isStreaming && autoScan) {
      intervalRef.current = setInterval(() => {
        captureAndSearch()
      }, scanInterval)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isStreaming, autoScan, scanInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        📷 Live Camera Face Detection
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Real-time surveillance camera stream with automated face detection & criminal database matching.
      </Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left Column: Video Feed */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              minHeight: 360,
              bgcolor: '#111',
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              border: '2px solid #1a237e'
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                display: isStreaming ? 'block' : 'none'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            />

            {!isStreaming && (
              <Stack spacing={2} alignItems="center">
                <VideocamOffIcon sx={{ fontSize: 64, color: '#666' }} />
                <Typography color="grey.400" variant="body1">
                  Camera stream offline
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<VideocamIcon />}
                  onClick={startCamera}
                >
                  Start Live Camera Stream
                </Button>
              </Stack>
            )}
          </Box>

          {/* Controls Bar */}
          {isStreaming && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<VideocamOffIcon />}
                  onClick={stopCamera}
                >
                  Stop
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={scanning ? <CircularProgress size={18} color="inherit" /> : <CameraIcon />}
                  disabled={scanning}
                  onClick={captureAndSearch}
                >
                  Scan Frame
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoScan}
                      onChange={(e) => setAutoScan(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Auto Scan"
                />

                <Select
                  size="small"
                  value={scanInterval}
                  onChange={(e) => setScanInterval(e.target.value)}
                  disabled={!autoScan}
                >
                  <MenuItem value={500}>Every 0.5s</MenuItem>
                  <MenuItem value={1000}>Every 1.0s</MenuItem>
                  <MenuItem value={2000}>Every 2.0s</MenuItem>
                </Select>
              </Stack>
            </Stack>
          )}
        </Grid>

        {/* Right Column: Live Detection & Match Alert Panel */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Live Surveillance Match Monitor
          </Typography>

          {!latestResult && (
            <Card variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 3, minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                {isStreaming
                  ? 'Scanning camera feed for criminal face matches…'
                  : 'Start live camera to begin automated surveillance.'}
              </Typography>
            </Card>
          )}

          {latestResult && (
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                minHeight: 360,
                borderColor: latestResult.matchFound ? '#4caf50' : '#e0e0e0',
                bgcolor: latestResult.matchFound ? '#f1f8e9' : '#fafafa',
                boxShadow: latestResult.matchFound ? '0 4px 16px rgba(76,175,80,0.2)' : 'none'
              }}
            >
              {latestResult.matchFound ? (
                <Stack spacing={2}>
                  <Alert icon={<WarningIcon fontSize="inherit" />} severity="error" sx={{ fontWeight: 700 }}>
                    CRIMINAL MATCH DETECTED!
                  </Alert>

                  {latestResult.registeredPhotoPath && (
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #81c784'
                      }}
                    >
                      <img
                        src={`http://localhost:8080${latestResult.registeredPhotoPath}`}
                        alt="Matched Criminal"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  <Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {latestResult.personName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      ID: {latestResult.personCode}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`Match: ${(latestResult.confidence * 100).toFixed(1)}%`}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      label={latestResult.matchStrength}
                      variant="outlined"
                      color="success"
                      size="small"
                    />
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: 300 }}>
                  <CheckCircleIcon sx={{ fontSize: 56, color: '#4caf50' }} />
                  <Typography variant="h6" fontWeight={700} color="success.dark">
                    No Match / Unknown Face
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Face visible in camera stream, but not matching any record in registry.
                  </Typography>
                </Stack>
              )}
            </Card>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}
