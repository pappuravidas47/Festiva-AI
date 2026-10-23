# Festiva AI — Celebration Planning Assistant
> **"Your Celebration, Powered by AI."**

Festiva AI is an enterprise-grade GenAI-powered celebration management application built on the modern MERN stack (MongoDB, Express.js, React.js, Node.js) with TypeScript and Tailwind CSS. It empowers hosts to effortlessly plan weddings, birthdays, anniversaries, and community galas with customized AI blueprints, dynamic budget tracking, chronological milestone checklists, vendor quotation comparisons, and instant document exports.

---

## 🌟 Key Features

### 1. 🤖 GenAI-Powered Celebration Blueprint Architect
- **Official Google Gemini AI Integration**: Generates deep, highly personalized event blueprints using the official `@google/generative-ai` SDK on the backend.
- **Full Blueprint Spectrum**: Concept narrative, bespoke color palettes with copyable hex values, venue specifications & space requirements, decor focal points, course-by-course banquet menus with dietary tagging, and day-of-event schedules.
- **Natural Language Refinements**: Live interactive prompt drawer allowing requests such as *"Reduce my budget from ₹50,000 to ₹35,000"*, *"Suggest a minimalist wedding theme"*, or *"Suggest affordable decoration for 100 guests"*.
- **Section Regeneration**: Refresh individual sections on demand.
- **Graceful Engine Fallback**: If `GEMINI_API_KEY` is not yet configured, the system seamlessly uses Festiva's curated celebration templates, clearly labelled as demo previews without ever breaking functionality.

### 2. 💰 Precision Budget Management System
- **Total vs. Planned vs. Actual vs. Remaining**: Real-time financial calculations in application code (rejecting negative figures and invalid inputs).
- **Over-Budget Warning Callouts**: Immediate visual alert banners when total actual expenses exceed target allocations.
- **Visual Analytics**: Interactive Recharts bar and category breakdown charts.
- **Category Classifications**: Venue, Catering, Decoration, Photography, Entertainment, Invitations, Transportation, Gifts, Miscellaneous, Contingency.
- **Smart Savings Insights**: Category-specific advice based on industry percentages.
- **CSV & Ledger Exports**: One-click spreadsheet generation.

### 3. 📅 Chronological Milestones & Timeline
- **Event-Date-Aware Scheduling**: Auto-calculates milestone deadlines based on your celebration date.
- **Auto-Generate Milestones**: Generates sensible deadlines for contract locks, catering tastings, decor finalization, invitation drops, and final rehearsals.
- **Task Tracking**: Priority badges (Urgent, High, Medium, Low), category filters, status checkboxes (with celebratory confetti upon completion!), and overdue task indicators.

### 4. 🏢 Vendor Management & AI Vetting Questions
- **Category Coverage**: Venue, Caterer, Decorator, Photographer, Entertainment, Transport, Other.
- **Status Pipeline**: To Contact ➔ Contacted ➔ Quotation Received ➔ Shortlisted ➔ Booked ➔ Cancelled.
- **AI-Generated Interview Questions**: Category-specific pointed vetting questions to ask before signing contracts.
- **Budget Auto-Link**: When a vendor is marked as "Booked", their agreed price can automatically sync with your budget ledger.

### 5. 👥 Guest Management & Instant Invitations
- **RSVP Tracking**: Confirmed Attending, Pending, Declined, plus-one headcount calculations.
- **AI Invitation Copy Generator**: Customized Formal, Warm/Casual, and short WhatsApp/SMS invitation drafts with 1-click clipboard copy.
- **Guest List CSV Export**: Direct spreadsheet download with dietary tags and table numbers.

### 6. 🎨 Inspiration Studio
- **Curated Moodboards**: Filter by event type (Wedding, Birthday, Community), style (Royal, Boho, Neon, Sweet, Rustic, Modern), and budget tier.
- **Interactive Hex Copy**: 1-click copy for curated color harmonies.
- **Apply to My Event**: Push a theme and color palette directly to any existing event in your workspace.
- **Brainstorm with AI**: Instant generative idea prompt box.

### 7. 📄 Comprehensive PDF & CSV Dossier Export
- **Client-Side Vector PDF Generator**: Generates high-resolution branded celebration dossiers containing summary headers, budget tables, milestone timeline tables, vendor directories, and guest summaries using `jspdf` and `jspdf-autotable`.
- **Print-Friendly View**: Custom CSS `@media print` rules for physical paper printing.
- **Individual CSV Exports**: For Budget Items, Tasks, Vendors, and Guests.

---

## 🏗️ Project Architecture & Folder Structure

```
Festiva-AI/
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # ProtectedRoute, LoadingSpinner, EmptyState
│   │   │   ├── layout/        # Navbar, Footer, EventNavTabs
│   │   │   └── ui/
│   │   ├── context/           # AuthContext & Session management
│   │   ├── pages/             # Landing, Sign In, Sign Up, Dashboard, Event Wizard,
│   │   │                      # AI Plan, Budget, Timeline, Vendors, Guests,
│   │   │                      # Inspiration Studio, Export, Profile, 404
│   │   ├── services/          # Typed Axios API client & endpoints
│   │   ├── types/             # TypeScript interfaces for all data models
│   │   ├── App.tsx            # React Router tree
│   │   ├── main.tsx           # Application entrypoint
│   │   └── index.css          # Tailwind CSS & custom design tokens
│   ├── package.json
│   ├── vite.config.ts         # Vite server with /api proxy to port 5000
│   ├── tailwind.config.js     # Festiva luxury color palette tokens
│   ├── tsconfig.json
│   └── .env.example
│
└── backend/
    ├── src/
    │   ├── config/            # Database (Mongoose) & Environment config
    │   ├── models/            # User, Event, EventPlan, BudgetItem, Task, Vendor, Guest, Inspiration
    │   ├── controllers/       # Auth, Event, AI, Budget, Task, Vendor, Guest, Inspiration, Health
    │   ├── routes/            # REST endpoint definitions
    │   ├── middleware/        # JWT Authentication, Zod Validator, Rate Limiter, Error Handler
    │   ├── services/ai/       # Gemini AI SDK integration & curated template engine
    │   ├── validators/        # Zod request validation schemas
    │   ├── app.ts             # Express app setup, Helmet, CORS, Middleware
    │   └── server.ts          # Server listener on port 5000
    ├── tests/                 # Vitest & Supertest API integration tests
    ├── package.json
    ├── tsconfig.json
    └── .env.example
```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/festiva_ai
JWT_SECRET=festiva_ai_super_secret_jwt_key_production_2025
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
CLIENT_URL=http://localhost:5173
```
> **Note on MongoDB**: Festiva AI connects to local MongoDB (`mongodb://127.0.0.1:27017/festiva_ai`) out-of-the-box or any MongoDB Atlas URI.
> **Note on Gemini AI**: If `GEMINI_API_KEY` is omitted, the backend automatically operates with the Festiva Curated Intelligence engine, allowing full end-to-end functionality.

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_API_BASE_URL=/api
VITE_APP_NAME="Festiva AI"
VITE_APP_TAGLINE="Your Celebration, Powered by AI."
```

---

## 🚀 Quick Startup Guide

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm run dev
```
*Verification: Open `http://localhost:5000/api/health` to confirm server and database status.*

### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
*Access the application at `http://localhost:5173`.*

---

## 🧪 Testing & Quality Assurance

### Run Backend Tests:
```bash
cd backend
npm test          # Runs Vitest unit and integration test suite
npm run typecheck # Verifies zero TypeScript compilation errors
npm run build     # Compiles production TypeScript bundle to dist/
```

### Run Frontend Tests:
```bash
cd frontend
npm test          # Runs Vitest React Testing Library suite
npm run typecheck # Verifies TypeScript consistency
npm run build     # Generates optimized Vite production bundle
```

---

## 🔒 Security Best Practices Implemented
- **Password Protection**: Passwords salted and hashed with `bcryptjs`.
- **JWT Authorization**: Cryptographically signed tokens verified on all private endpoints.
- **Resource Ownership Enforcement**: Database queries strictly filter by `userId` to ensure users only access their own private celebrations.
- **Input Validation**: Strict request payload schema validation using `zod`.
- **API Defense**: Security headers via `helmet`, rate limiting via `express-rate-limit`, and CORS origin restrictions.
- **Secret Isolation**: Zero server-side API keys or database credentials exposed to the frontend bundle.
