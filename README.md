# 🏛️ CivicAI - Intelligent Civic Issue Resolution Platform

CivicAI is an AI-powered municipal issue reporting, automated triage, and lifecycle management platform designed for citizens, municipal authorities, and field workers.

---

## 🌟 Key Features

1. **Multimodal AI Analysis**: Uses Google Gemini Vision API to instantly analyze photos of civic issues (potholes, garbage, streetlights, water leakage), classify categories, estimate severity, verify GPS plausibility, and draft resolution recommendations.
2. **Citizen Portal**:
   - Quick issue reporting with camera capture, auto-GPS tagging, and voice description.
   - Live status tracking with progress bars, authority assignment, and timeline events.
   - Community feed with upvoting, comments, and resolved issue gallery.
3. **Department Authority Dashboard**:
   - Interactive GIS map visualization with heatmaps and filterable issue pins.
   - Automated & manual worker task assignment with priority routing.
   - Resolution verification workflow (approving or rejecting worker completion proof).
   - Real-time SLA tracking and performance metrics.
4. **Field Worker Mobile View**:
   - Dedicated task queue organized by priority and location distance.
   - Integrated turn-by-turn navigation link to issue coordinates.
   - Before-and-after photo resolution upload with notes.
5. **Cross-Platform Ready**:
   - Web application (Single-port Express + React SPA).
   - Native Android scaffolding configured via Capacitor (`android/`).

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas free cloud cluster)

### 2. Installation
```bash
# Clone or extract project folder, then navigate into it:
cd civic-ai

# Install all dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your keys:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/civic_ai
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=civicai_secret_key_2026_super_secure
```

### 4. Seed Default Accounts & Demo Data
Initialize the database with sample departments, authorities, workers, and issues:
```bash
npm run seed
```

### 5. Start Application
```bash
# Run both Frontend & Backend in Development Mode:
# Terminal 1 (Backend API):
npm run server

# Terminal 2 (Vite Frontend):
npm run dev
```

Or run the combined production build on a single port (port 5000):
```bash
npm run build
npm start
```
Access the application at: `http://localhost:5000` (or `http://localhost:5173` in dev mode).

---

## 🔑 Default Demo Accounts

All pre-seeded demo accounts use password: **`password123`**

| Role | Email | Department / Specialization |
| :--- | :--- | :--- |
| **Citizen** | `citizen@civicai.org` | General Citizen Account |
| **Road Authority** | `road.authority@civicai.gov` | Road Maintenance & Potholes |
| **Sanitation Authority** | `sanitation.authority@civicai.gov` | Waste Management & Garbage |
| **Electrical Authority** | `electrical.authority@civicai.gov` | Streetlights & Power Grids |
| **Water Authority** | `water.authority@civicai.gov` | Water Supply & Leakages |
| **Field Worker** | `ramesh.worker@civicai.gov` | Road Repair Field Specialist |
| **Field Worker** | `suresh.worker@civicai.gov` | Sanitation Field Specialist |

---

## 📁 Project Architecture

```
civic-ai/
├── android/                 # Capacitor Android native project & Gradle config
├── dist/                    # Built production frontend bundle (served by Express)
├── public/                  # Public static assets & icons
├── server/
│   ├── config/              # Database connection & environment configuration
│   ├── controllers/         # Request handlers (auth, issues, workers, stats)
│   ├── middleware/          # JWT auth, role validation, file upload
│   ├── models/              # Mongoose schemas (User, Issue, Worker, ActivityLog)
│   ├── routes/              # Express API route declarations
│   ├── seed/                # Seed scripts for initial authorities and mock issues
│   ├── services/            # Gemini AI analysis & classification engine
│   └── index.js             # Main server entrypoint (API + static SPA serving)
├── src/
│   ├── components/          # Reusable UI components (Navbar, Modal, Maps, Cards)
│   ├── context/             # AuthContext, NotificationContext, ThemeContext
│   ├── hooks/               # Custom React hooks (useGeolocation, useOfflineSync)
│   ├── pages/               # Views (Home, CitizenReport, AuthorityDashboard, WorkerPortal, Login)
│   ├── services/            # Axios API clients & local storage sync
│   ├── App.jsx              # Routing & application layout
│   └── main.jsx             # React entrypoint
├── Dockerfile               # Container deployment configuration
├── docker-compose.yml       # Multi-container orchestration (App + MongoDB)
├── render.yaml              # Render.com Blueprint deployment specification
└── package.json             # Scripts & dependencies
```

---

## ☁️ Cloud Deployment (Render.com)

1. Push this repository to GitHub.
2. In [Render.com](https://render.com), click **New +** $\rightarrow$ **Web Service** $\rightarrow$ Select your GitHub repo.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `GEMINI_API_KEY`: Your Gemini API Key
   - `JWT_SECRET`: Random secure string
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service**.
6. Once deployed, open the Render **Shell** tab and run `npm run seed` to populate demo accounts.

---

## 📱 Mobile App (Android APK)

To build the native Android application:
1. Open Android Studio and open the `android/` directory inside this project.
2. Or build directly via command line:
   ```bash
   npm run cap:sync
   npm run cap:build:apk
   ```
   The debug APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 📄 License
MIT License - Built for civic enhancement & smart governance.
