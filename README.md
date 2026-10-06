# MeetingMind — AI Meeting Processing Workspace

> **Turn Meetings Into Action.**

An AI-powered full-stack web application that converts raw meeting transcripts into structured summaries, decisions, action items, owners, priorities, and follow-ups.

---

## 🚀 Quick Start

```bash
# 1. Install all dependencies
npm install
cd server && npm install
cd ../client && npm install

# 2. Configure environment variables (see below)
# Edit server/.env with your API key

# 3. Start both servers
cd ..
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:5000  
- **API Health:** http://localhost:5000/api/health

---

## ⚙️ Environment Variables

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
AI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### Getting a Gemini API Key (Free)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"** (free tier available)
3. Copy and paste into `server/.env` as `AI_API_KEY=...`
4. **OR** go to **Settings** inside the app and enter your key there

---

## 🏗️ Project Structure

```
MeetingMind/
├── client/                    # React + Vite + Tailwind CSS frontend
│   └── src/
│       ├── components/        # Navbar, Sidebar, MeetingCard, ActionItem, StatCard
│       ├── context/           # AuthContext (JWT + session persistence)
│       ├── pages/             # Dashboard, CreateMeeting, Meetings, MeetingDetails,
│       │                        ActionItemsPage, Login, Register, Settings
│       └── services/          # api.js (Axios with interceptors)
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # db.js (MongoDB + Atlas), env.js
│   │   ├── controllers/       # authController, meetingController, aiController
│   │   ├── middleware/        # authMiddleware (JWT), errorMiddleware
│   │   ├── models/            # User.js, Meeting.js (Mongoose schemas)
│   │   ├── routes/            # authRoutes, meetingRoutes, aiRoutes
│   │   └── services/          # aiService.js (Google Gemini API integration)
│   ├── .env                   # ← Configure your keys here
│   └── server.js
│
├── .gitignore                 # Excludes .env, node_modules, dist
├── package.json               # Root scripts: npm run dev, server, client
└── README.md
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/settings` | Update profile & custom API key |
| POST | `/api/auth/logout` | Logout |

### Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings` | Get all user meetings (with search/filter) |
| GET | `/api/meetings/stats/dashboard` | Dashboard statistics |
| GET | `/api/meetings/:id` | Get single meeting |
| PUT | `/api/meetings/:id` | Update meeting |
| DELETE | `/api/meetings/:id` | Delete meeting |
| POST | `/api/meetings/:id/analyze` | Trigger AI analysis |
| PATCH | `/api/meetings/:id/action-items/:itemId` | Update action item |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-raw` | Analyze raw transcript without saving |
| POST | `/api/ai/test-key` | Test Gemini API key validity |

---

## 🧪 Sample Transcript for Testing

```
Khushi: We need to complete the MeetingMind dashboard by Thursday.
Rahul: I can complete the authentication API by tomorrow.
Priya: I will work on the dashboard UI and finish it by Wednesday.
Khushi: Good. We also need to integrate the AI meeting analysis.
Rahul: I can handle the backend AI integration after finishing authentication.
Priya: We should also test the application before the final submission.
Khushi: Let's have another review meeting on Friday.
```

The app includes a **"Load Sample Transcript"** button in the Create Meeting page.

---

## 🛡️ Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT tokens with 30-day expiry
- All meeting routes require valid JWT
- Ownership checks on every meeting read/update/delete
- User A cannot access User B's meetings (HTTP 403)
- API keys stored only in `.env` — never exposed to frontend

---

## 🎯 Complete Feature Checklist

- ✅ Register / Login / Logout
- ✅ JWT authentication with persistent sessions
- ✅ Protected routes (redirect to /login)
- ✅ Dashboard with statistics (total meetings, processed, pending/completed tasks)
- ✅ Recent meetings on dashboard
- ✅ Create meeting with title, date, participants, transcript
- ✅ Upload .txt transcript file
- ✅ Load sample transcript button
- ✅ Save as Draft
- ✅ AI analysis via Google Gemini API (real, not mocked)
- ✅ Review and edit AI output before saving
- ✅ Summary, Key Points, Decisions, Action Items, Follow-ups
- ✅ Action item: owner, deadline, priority, status
- ✅ Save finalized meeting to MongoDB
- ✅ Edit meeting details (all fields)
- ✅ Regenerate AI analysis
- ✅ Copy summary to clipboard
- ✅ Update action item status (Pending → In Progress → Completed)
- ✅ Meeting history with search, filters, date range, sort
- ✅ Delete meetings
- ✅ Dedicated Action Items page with cross-meeting task tracker
- ✅ Settings page for Gemini API key configuration
- ✅ Responsive design (mobile / tablet / desktop)
- ✅ Loading states and error handling throughout
- ✅ User data isolation (no cross-user data access)

---

## 🔑 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, Tailwind CSS 3 |
| UI Icons | lucide-react |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | bcryptjs, jsonwebtoken |
| AI Provider | Google Gemini API (gemini-2.0-flash) |

---

## 📋 npm Scripts

```bash
npm run dev          # Start both frontend & backend (concurrently)
npm run server       # Start backend only (with nodemon)
npm run client       # Start frontend only (Vite dev server)
npm run build        # Build frontend for production
npm run install:all  # Install all dependencies (root + server + client)
```
