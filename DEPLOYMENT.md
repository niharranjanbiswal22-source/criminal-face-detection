# 🚀 Production Deployment Guide

This guide explains how to deploy the **Criminal Face Detection & Surveillance System** to **Render** and **Vercel**.

---

## 📌 Important Architecture Note

- **Frontend (Vite React UI)**: Deploy on **Vercel** or **Render** (100% Free).
- **Backend (Spring Boot + OpenCV AI)**: Deploy on **Render** as a **Docker Web Service** (Java 21 + OpenCV runtime).

> ⚠️ *Note: Vercel does not support long-running Java Spring Boot or C++ native libraries (OpenCV). Therefore, your **Backend must run on Render**.*

---

## 🌐 Step 1: Deploy Backend on Render (Render.com)

1. Log in to [Render.com](https://render.com) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository:
   `https://github.com/niharranjanbiswal22-source/criminal-face-detection`
3. Configure the Web Service:
   - **Name**: `criminal-face-backend`
   - **Region**: Choose nearest region (e.g., Singapore / Oregon / Frankfurt)
   - **Environment**: **Docker**
   - **Docker Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Instance Type**: Free or Starter
4. Add Environment Variables in Render:
   - `SPRING_PROFILES_ACTIVE`: `h2`
   - `PORT`: `8080`
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://criminal-face-backend.onrender.com`).

---

## 🎨 Step 2: Deploy Frontend on Vercel (Vercel.com)

1. Log in to [Vercel.com](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
2. Import your GitHub repository `criminal-face-detection`.
3. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://criminal-face-backend.onrender.com/api` *(replace with your Render backend URL)*
5. Click **Deploy**.

---

## ✅ Summary

Your full-stack AI Criminal Face Detection system will now be live:
- **Frontend URL**: `https://criminal-face-detection.vercel.app`
- **Backend API**: `https://criminal-face-backend.onrender.com`
