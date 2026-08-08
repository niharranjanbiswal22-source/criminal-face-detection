# 🚀 QUICK START GUIDE

## ⚡ System Already Running!

✅ Backend: http://localhost:8080  
✅ Frontend: http://localhost:5173  
✅ Database: H2 In-Memory (auto-initialized)  

---

## 📝 LOGIN

```
URL: http://localhost:5173
Username: admin
Password: Admin@123
```

---

## 🎯 3-STEP WORKFLOW

### Step 1: Register Criminal Faces
1. Click **"Register Person"** in the navbar
2. Enter:
   - **Person ID**: `CRIMINAL_001` (unique identifier)
   - **Full Name**: `John Doe` (criminal name)
   - Click **"Upload Photo"** → Select face image
3. Click **"Register Person"** button
4. ✅ Face detected, embedding generated, stored in database

### Step 2: Upload Query Image
1. Click **"Face Search"** in the navbar
2. Click **"Choose Photo"**
3. Select an unknown face image (CCTV screenshot, suspect photo, etc.)
4. Click **"Search"**

### Step 3: View Results
- System shows matching criminals with:
  - Match confidence score
  - Person name & ID
  - Registration photo
  - Similarity percentage

---

## 🎓 SAMPLE DATA

### Test Criminal #1
```
Person ID: CRIMINAL_001
Name: John Doe
Category: Armed Robbery
Status: Active
```

### Test Criminal #2
```
Person ID: CRIMINAL_002
Name: Jane Smith
Category: Fraud
Status: Active
```

---

## 💾 DATABASE ACCESS (Advanced)

**H2 Web Console**
```
URL: http://localhost:8080/h2-console
User: SA
Password: (leave empty)
```

**View Data:**
```sql
-- All registered criminals
SELECT * FROM person;

-- All face embeddings
SELECT * FROM face_embedding;

-- Search by name
SELECT * FROM person WHERE name LIKE '%John%';
```

---

## 🔌 API EXAMPLES

### 1. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

### 2. Register Person
```bash
curl -X POST http://localhost:8080/api/persons/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "personId=CRIMINAL_001" \
  -F "name=John Doe" \
  -F "photo=@/path/to/photo.jpg"
```

### 3. Identify Face
```bash
curl -X POST http://localhost:8080/api/recognition/identify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/query.jpg"
```

---

## ⚙️ CONFIGURATION

### Change Admin Password
1. Stop backend: `Ctrl+C` in terminal
2. Modify in code: `DataInitializer.java`
3. Rebuild: `mvn clean spring-boot:run`

### Add New Users
Edit backend and add to `DataInitializer.java`:
```java
User newUser = new User();
newUser.setUsername("officer1");
newUser.setPassword(passwordEncoder.encode("NewPass123"));
newUser.setRole(Role.ADMIN);
userRepository.save(newUser);
```

### Change Face Detection Threshold
Edit `FaceDetector.java`:
```java
private static final double DETECTION_THRESHOLD = 0.5; // Adjust sensitivity
```

---

## 🛑 STOPPING SERVICES

### Stop Backend
In the terminal running Maven, press `Ctrl+C`

### Stop Frontend
In the terminal running npm, press `Ctrl+C`

### Stop Both
```powershell
Get-Process java,node | Stop-Process -Force
```

---

## 🔄 RESTARTING SERVICES

### Backend Only
```powershell
$env:Path = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot\bin;d:\download\apache-maven-3.9.14\bin;$($env:Path)"
cd "d:\download\face-recognition-mvp\face-recognition-mvp\backend"
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=h2
```

### Frontend Only
```powershell
cd "d:\download\face-recognition-mvp\face-recognition-mvp\frontend"
npm run dev
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "Port 8080 already in use"
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID)
taskkill /PID 12345 /F
```

### Issue: "Face not detected in photo"
- **Solution**: Use clear, front-facing photos
- Face must be at least 50x50 pixels
- Adequate lighting required
- Remove sunglasses/masks

### Issue: "Cannot connect to backend"
- Check if backend is running: Visit http://localhost:8080/api/health
- Check firewall settings
- Verify port 8080 is accessible

### Issue: "CORS error in browser"
- **Solution**: Already fixed in backend
- Clear browser cache: Ctrl+Shift+Delete
- Try incognito mode

---

## 📊 TESTING CHECKLIST

- [ ] Backend health check: http://localhost:8080/api/health
- [ ] Frontend loads: http://localhost:5173
- [ ] Login works: admin / Admin@123
- [ ] Register page accessible
- [ ] Search page accessible
- [ ] Upload photo functionality works
- [ ] Database H2 console accessible: http://localhost:8080/h2-console
- [ ] Mock embeddings working (development mode)

---

## 🎯 WHAT'S WORKING

✅ User authentication (JWT)  
✅ Person registration with photo upload  
✅ Face detection using OpenCV  
✅ Face embedding generation (mock)  
✅ Face search/identification  
✅ Database persistence  
✅ React frontend  
✅ RESTful API  
✅ CORS configuration  
✅ Role-based access control  

---

## ⚠️ LIMITATIONS (Development Mode)

⚠️ Face embeddings are mock (deterministic but not real ArcFace)  
⚠️ H2 in-memory database (loses data on restart)  
⚠️ No HTTPS/SSL (development only)  
⚠️ Single-threaded database  
⚠️ File uploads limited to 10MB  

---

## 📈 NEXT: PRODUCTION DEPLOYMENT

1. **Download Real ONNX Model**
   - Visit: https://github.com/deepinsight/insightface/releases
   - Download: arcface_resnet100.onnx
   - Place at: `./models/arcface_resnet100.onnx`
   - Restart backend → Automatic detection!

2. **Setup PostgreSQL**
   - Install PostgreSQL 14+
   - Create database: `face_recognition_db`
   - Update connection string in `application.yml`

3. **Enable HTTPS**
   - Generate SSL certificate
   - Configure in Spring Boot properties
   - Update frontend API endpoint

4. **Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

---

**Ready to go! Start registering criminal faces! 👮‍♂️🔍**
