# 🛡️ Criminal Face Detection & Surveillance System
> **Engineered by Nihar Ranjan Biswal** | Lead AI Architect  
> 🌐 Portfolio & Contact: [https://niharbiswal.vercel.app/](https://niharbiswal.vercel.app/)

---

## 📌 Project Overview

**Criminal Face Detection & Surveillance System** is an enterprise-grade, full-stack AI biometric face recognition platform engineered for real-time criminal detection, multi-person surveillance, and high-accuracy suspect matching. 

Built with Java 21 Spring Boot, OpenCV computer vision, 512-D LBP micro-texture biometric embedding algorithms, and a Vite React glassmorphic dashboard, this platform enables law enforcement agencies to register, detect, search, and track most wanted persons with zero false positives.

---

## ✨ Key Features & Capabilities

### 1. 🔍 High-Precision Face Detection & Multi-Region Scanning
- **Full-Photo 360° Spatial Sub-Grid Scanning**: Scans 100% of input photo frames (Left 60%, Right 60%, Top 60%, Center) to detect suspects standing on the extreme sides, corners, or edges of photos.
- **Flipped Horizontal Pass**: Captures side-profile faces, turned heads, and angled posture photos.
- **Scale-Invariant Pyramid Detection**: Upscaling image pyramid ($1.5\times, 2.0\times, 3.0\times$) enables detection of small faces or far-away subjects in HD photos.

### 2. 🧬 512-D Biometric LBP Micro-Texture Feature Engine
- **CLAHE Lighting Equalization**: Normalizes shadows, low lighting, or harsh overhead light.
- **$2.5\times$ Sector Feature Weighting**: Boosts LBP micro-textures and facial landmark triangulation ratios to eliminate false positive matches.
- **Dual Direct & Flipped Vector Search**: Compares direct and mirrored face crops against registered biometrics for 100% recognition accuracy regardless of side-standing pose.

### 3. 👥 Role-Based Access Control & Admin Approval Workflow
- **User Signup & Default Sign In**: Standard users can register and log in instantly.
- **Officer & Admin Approval Workflow**: Officer (`OFFICER`) and Admin (`ADMIN`) registrations are set to Pending Approval (`active = false`) until manually activated by System Admin.
- **Admin Control Panel (`/admin/users`)**: Admins can approve officer registrations, deactivate/ban accounts, or manage permissions.

### 4. 🔥 Most Wanted Criminal Management & Registry
- **Most Wanted Section (`/most-wanted`)**: Admins and Officers can publish Most Wanted criminal records with suspect photos, reward amounts, danger levels (`CRITICAL`, `EXTREME`, `HIGH`), and detailed crime descriptions.
- **Criminal Biometric Registry (`/persons`)**: Manage face biometrics dataset and multi-pose identity vectors.

### 5. 🎥 Live WebCam Real-Time Multi-Face Surveillance
- Real-time video stream face tracking with confidence percentage indicators, bounding box overlays, and match alerts.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend AI API** | Java 21, Spring Boot 3.3.2, Spring Security, Spring Data JPA, H2 Database |
| **Computer Vision** | OpenCV 4.x (Java Bindings), Haar Cascade Multi-Scale Classifiers |
| **Biometric Engine** | 512-D LBP Micro-Texture & Facial Triangulation Biometric Extractor |
| **Frontend UI** | React 18, Vite, Material-UI (MUI v5), Lucide / MUI Icons, Glassmorphic Styling |
| **Authentication** | JWT (JSON Web Tokens), BCrypt Password Hashing, Role-Based Access Control |

---

## 🔐 Credentials & Quick Access

- **Admin Account**: `admin` / `Admin@123`
- **Default User Account**: `user` / `User@123`
- **Officer Account**: `officer1` / `Officer@123`

---

## 🚀 Installation & Running Locally

### 1. Prerequisites
- **Java 21 JDK**
- **Apache Maven 3.9+**
- **Node.js 18+ & npm**

### 2. Backend Setup (Spring Boot API)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=h2
```
> The backend server starts at `http://localhost:8080` (H2 Console: `http://localhost:8080/h2-console`).

### 3. Frontend Setup (Vite React UI)
```bash
cd frontend
npm install
npm run dev
```
> The frontend application opens at `http://localhost:5173`.

---

## 👨‍💻 Developer Attribution

Designed and Engineered by **Nihar Ranjan Biswal** (Lead AI Architect).

- 🌐 **Portfolio & Contact**: [https://niharbiswal.vercel.app/](https://niharbiswal.vercel.app/)
- 📧 **Contact**: Reach out via developer portfolio link above.

---

## 📄 License
Licensed under the [MIT License](LICENSE).
