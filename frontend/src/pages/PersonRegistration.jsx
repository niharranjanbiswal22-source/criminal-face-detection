import React, { useState, useRef } from 'react'
import {
  Paper, Typography, TextField, Button, Box, Alert, Avatar, Stack, Tabs, Tab,
  LinearProgress, Chip, Grid, Card
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import VideocamIcon from '@mui/icons-material/Videocam'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import api from '../api/axios.js'

const ENROLL_STEPS = [
  { id: 1, label: 'Center Frontal', icon: '📸', instruction: 'Look straight into the camera with a neutral face.' },
  { id: 2, label: 'Slightly Left', icon: '👈', instruction: 'Turn your head slightly to your LEFT.' },
  { id: 3, label: 'Slightly Right', icon: '👉', instruction: 'Turn your head slightly to your RIGHT.' },
  { id: 4, label: 'Slightly Up', icon: '👆', instruction: 'Tilt your head slightly UPWARDS.' },
  { id: 5, label: 'Expression', icon: '😊', instruction: 'Smile or express naturally for expression invariant training.' }
]

export default function PersonRegistration() {
  const [personCode, setPersonCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(2) // Default to 2 (AI Multi-Angle Training)

  // Webcam states
  const videoRef = useRef(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  // Multi-Angle Face Lock Enrollment state
  const [enrollStepIndex, setEnrollStepIndex] = useState(0)
  const [datasetFiles, setDatasetFiles] = useState([])
  const [datasetPreviews, setDatasetPreviews] = useState([])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsCameraActive(true)
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Camera access denied or webcam not available.' })
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const captureSinglePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    const vw = video.videoWidth || 640
    const vh = video.videoHeight || 480

    // Crop central face box strictly
    const cropW = Math.min(vw, (vh * 0.75))
    const cropH = cropW
    const cropX = (vw - cropW) / 2
    const cropY = (vh - cropH) / 2

    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, 300, 300)

    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `${personCode || 'captured'}_single.jpg`, { type: 'image/jpeg' })
      setImage(file)
      setPreview(URL.createObjectURL(blob))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const captureEnrollStep = () => {
    if (!videoRef.current || enrollStepIndex >= ENROLL_STEPS.length) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    const vw = video.videoWidth || 640
    const vh = video.videoHeight || 480

    // Extract tight face crop inside annotation box (removing room background)
    const faceW = Math.min(vw * 0.65, vh * 0.75)
    const faceH = faceW
    const faceX = (vw - faceW) / 2
    const faceY = (vh - faceH) / 2

    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')

    // Draw tight face crop ONLY
    ctx.drawImage(video, faceX, faceY, faceW, faceH, 0, 0, 300, 300)

    canvas.toBlob((blob) => {
      if (!blob) return
      const stepObj = ENROLL_STEPS[enrollStepIndex]
      const file = new File([blob], `${personCode || 'person'}_step_${stepObj.id}.jpg`, { type: 'image/jpeg' })
      const prevUrl = URL.createObjectURL(blob)

      const updatedFiles = [...datasetFiles, file]
      const updatedPreviews = [...datasetPreviews, { label: stepObj.label, icon: stepObj.icon, url: prevUrl }]

      setDatasetFiles(updatedFiles)
      setDatasetPreviews(updatedPreviews)

      if (enrollStepIndex + 1 < ENROLL_STEPS.length) {
        setEnrollStepIndex(enrollStepIndex + 1)
      } else {
        stopCamera()
      }
    }, 'image/jpeg', 0.92)
  }

  const resetEnrollment = () => {
    setEnrollStepIndex(0)
    setDatasetFiles([])
    setDatasetPreviews([])
    stopCamera()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (mode === 2 && datasetFiles.length === 0) {
      setMessage({ type: 'error', text: 'Please complete the 5-step Face Lock enrollment to capture multi-angle dataset.' })
      return
    }

    if (mode !== 2 && !image) {
      setMessage({ type: 'error', text: 'Please upload or capture a photo first.' })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('personCode', personCode)
      formData.append('fullName', fullName)

      if (mode === 2) {
        datasetFiles.forEach((file) => {
          formData.append('images', file)
        })
      } else {
        formData.append('image', image)
      }

      await api.post('/persons/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const countMsg = mode === 2 ? `trained with ${datasetFiles.length} face-annotated pose embeddings` : 'registered with face crop data'
      setMessage({ type: 'success', text: `Person '${fullName}' successfully ${countMsg}!` })

      setPersonCode('')
      setFullName('')
      setImage(null)
      setPreview(null)
      resetEnrollment()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Registration failed. Check face visibility.',
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = personCode.trim() !== '' && fullName.trim() !== '' && (mode === 2 ? datasetFiles.length > 0 : Boolean(image))

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Register New Person / Criminal Record
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select enrollment mode: upload a photo, capture single camera snapshot, or use <strong>AI Multi-Angle Training</strong>.
      </Typography>

      {message && <Alert severity={message.type} sx={{ my: 2 }}>{message.text}</Alert>}

      <Tabs
        value={mode}
        onChange={(e, val) => { setMode(val); stopCamera(); }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab icon={<CloudUploadIcon />} label="Upload Photo File" iconPosition="start" />
        <Tab icon={<VideocamIcon />} label="Single Live Photo" iconPosition="start" />
        <Tab icon={<CenterFocusStrongIcon sx={{ color: '#4caf50' }} />} label="📱 AI Multi-Angle Training" iconPosition="start" />
      </Tabs>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Person ID / Code"
                value={personCode}
                onChange={(e) => setPersonCode(e.target.value)}
                placeholder="e.g. CRIMINAL_9556645"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Nihar Ranjan Biswal"
                required
              />
            </Grid>
          </Grid>

          {/* Mode 0: Single Upload */}
          {mode === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar src={preview} variant="rounded" sx={{ width: 100, height: 100, bgcolor: '#e0e0e0' }} />
              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                Choose Photo File
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
            </Box>
          )}

          {/* Mode 1: Single Camera Capture */}
          {mode === 1 && (
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  position: 'relative',
                  width: 360,
                  height: 270,
                  bgcolor: '#111',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: isCameraActive ? 'block' : 'none'
                  }}
                />

                {/* Face Target Frame Annotation */}
                {isCameraActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      width: 180,
                      height: 180,
                      border: '3px dashed #4caf50',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)'
                    }}
                  />
                )}

                {!isCameraActive && preview && (
                  <img src={preview} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {!isCameraActive && !preview && (
                  <Typography color="grey.400" variant="body2">
                    Click 'Start Camera' to capture photo
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={2}>
                {!isCameraActive ? (
                  <Button variant="outlined" startIcon={<VideocamIcon />} onClick={startCamera}>
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" color="success" startIcon={<CameraAltIcon />} onClick={captureSinglePhoto}>
                      Capture Face Photo
                    </Button>
                    <Button variant="outlined" color="error" onClick={stopCamera}>
                      Cancel Camera
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          )}

          {/* Mode 2: AI Multi-Angle Training */}
          {mode === 2 && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', borderColor: '#4caf50' }}>
              <Typography variant="h6" color="success.main" fontWeight={700} gutterBottom>
                📱 AI Multi-Angle Dataset Enrollment
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Train the recognition engine with 5 distinct face-annotated head poses to ensure 100% detection accuracy during live camera surveillance.
              </Typography>

              {/* Progress Bar */}
              <Box sx={{ width: '100%', mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" fontWeight={700}>
                    Dataset Enrollment Progress: {datasetFiles.length} / 5 Captured
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={700}>
                    {Math.round((datasetFiles.length / 5) * 100)}% Complete
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(datasetFiles.length / 5) * 100}
                  color="success"
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>

              <Grid container spacing={3}>
                {/* Left: Video Feed & Real-Time Face Annotation */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 280,
                      bgcolor: '#111',
                      borderRadius: 2,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #4caf50'
                    }}
                  >
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: isCameraActive ? 'block' : 'none'
                      }}
                    />

                    {/* Live Facial Annotation Scanner Box */}
                    {isCameraActive && enrollStepIndex < ENROLL_STEPS.length && (
                      <Box
                        sx={{
                          position: 'absolute',
                          width: 170,
                          height: 190,
                          border: '3px solid #4caf50',
                          borderRadius: 3,
                          pointerEvents: 'none',
                          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          pt: 1
                        }}
                      >
                        <Chip
                          label="AI FACE TARGET"
                          color="success"
                          size="small"
                          sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                        />
                      </Box>
                    )}

                    {!isCameraActive && (
                      <Stack spacing={1} alignItems="center">
                        <CenterFocusStrongIcon sx={{ fontSize: 54, color: '#4caf50' }} />
                        <Typography color="grey.300" variant="subtitle2" fontWeight={600}>
                          Multi-Angle AI Scanner Offline
                        </Typography>
                        <Button variant="contained" color="success" startIcon={<VideocamIcon />} onClick={startCamera}>
                          Start AI Scanner
                        </Button>
                      </Stack>
                    )}
                  </Box>

                  {/* Step Guidance Prompt */}
                  {isCameraActive && enrollStepIndex < ENROLL_STEPS.length && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #a5d6a7' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="h5">
                          {ENROLL_STEPS[enrollStepIndex].icon}
                        </Typography>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                            Step {enrollStepIndex + 1} of 5: {ENROLL_STEPS[enrollStepIndex].label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ENROLL_STEPS[enrollStepIndex].instruction}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {/* Controls */}
                  {isCameraActive && (
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      {enrollStepIndex < ENROLL_STEPS.length ? (
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<CameraAltIcon />}
                          onClick={captureEnrollStep}
                        >
                          Capture Face Pose ({enrollStepIndex + 1}/5)
                        </Button>
                      ) : (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Dataset Complete! Ready to Train & Save"
                          color="success"
                          sx={{ p: 2, fontWeight: 700, width: '100%' }}
                        />
                      )}
                      <Button variant="outlined" color="error" startIcon={<RestartAltIcon />} onClick={resetEnrollment}>
                        Reset
                      </Button>
                    </Stack>
                  )}
                </Grid>

                {/* Right: Captured Dataset Thumbnails */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Captured Face-Only Embeddings ({datasetFiles.length}/5)
                  </Typography>

                  <Grid container spacing={1.5}>
                    {ENROLL_STEPS.map((step, idx) => {
                      const captured = datasetPreviews[idx]
                      return (
                        <Grid item xs={6} sm={4} key={step.id}>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 1,
                              textAlign: 'center',
                              bgcolor: captured ? '#f1f8e9' : '#fafafa',
                              borderColor: captured ? '#81c784' : '#e0e0e0'
                            }}
                          >
                            <Box sx={{ position: 'relative', width: '100%', height: 75, mb: 1, borderRadius: 1, overflow: 'hidden', bgcolor: '#ccc' }}>
                              {captured ? (
                                <img src={captured.url} alt={step.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Typography variant="h5" sx={{ pt: 2, opacity: 0.5 }}>{step.icon}</Typography>
                              )}
                              {captured && (
                                <CheckCircleIcon sx={{ position: 'absolute', top: 4, right: 4, color: '#2e7d32', fontSize: 20 }} />
                              )}
                            </Box>
                            <Typography variant="caption" fontWeight={700} display="block" noWrap>
                              {step.label}
                            </Typography>
                          </Card>
                        </Grid>
                      )
                    })}
                  </Grid>

                  {datasetFiles.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<RestartAltIcon />}
                      onClick={resetEnrollment}
                      sx={{ mt: 2 }}
                    >
                      Clear & Re-capture Dataset
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !isFormValid}
            color={mode === 2 ? 'success' : 'primary'}
            sx={{ py: 1.4, fontWeight: 700 }}
          >
            {loading ? 'TRAINING & SAVING AI MODEL…' : mode === 2 ? `TRAIN & SAVE MULTI-ANGLE DATASET (${datasetFiles.length} POSES)` : 'REGISTER PERSON'}
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
