# CitizenFirst AI

**One citizen. One request. One connected government.**
SIH 2026 prototype — Problem Statement ID **SIH26129** (Government of Maharashtra).

CitizenFirst AI lets a citizen describe a civic issue in plain language, understands it with an AI layer,
routes it — even across multiple departments — as one trackable case, and gives every department and
government leader a transparent, explainable priority queue to work from.

This repository contains a full three-service implementation:

```
citizenfirst-ai/
├── frontend/     React 18 + Vite + Tailwind CSS — citizen & government web app
├── backend/      Node.js + Express — core API, priority scoring, routing, auth
└── ai-service/   Python + FastAPI — standalone AI/NLP microservice
```

## Quick start (all three services)

You'll need **Node.js 18+**, **npm**, and **Python 3.10+** installed.

### 1. Backend API (required)

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:5000
```

The backend runs **out of the box with zero database setup** — it seeds a realistic, clearly-labelled
in-memory dataset (Maharashtra cities, departments, ~50 demo cases) on boot. If you set `MONGO_URI` in
`.env` to a real MongoDB connection string, the app will still boot correctly (the in-memory store remains
the active data layer for this prototype; `src/models/*.js` documents the exact Mongoose schema to migrate
to for production).

### 2. Frontend (required)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

Open **http://localhost:5173**. Use "Report a Request" to try the full citizen flow without an account, or
sign in with a demo account (see below) to see the Government Command Center, Department Dashboard, or
Field Officer view.

### 3. AI microservice (optional, for the standalone architecture demo)

The backend already includes an equivalent mock AI layer in-process, so the product works fully with just
steps 1–2. The Python service exists to demonstrate the target architecture and is a drop-in swap point for
real NLP/CV models later.

```bash
cd ai-service
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Interactive API docs: **http://localhost:8001/docs**

## Demo accounts

All demo accounts use the password `demo1234`.

| Role | Email | What you'll see |
|---|---|---|
| Citizen | `citizen@demo.citizenfirst.ai` | My Dashboard, My Requests, Report a Request |
| Field Officer | `officer@demo.citizenfirst.ai` | Assigned cases for Road Infrastructure, status updates |
| Department Admin | `dept.admin@demo.citizenfirst.ai` | Municipal Services dashboard, workload, analytics |
| Government Admin | `gov.admin@demo.citizenfirst.ai` | **Command Center priority queue**, GIS Intelligence, Interoperability Hub, AI Insights |

## The core feature: explainable priority scoring

Every case gets a transparent **0–100 priority score** built from five inspectable factors:

| Factor | Weight |
|---|---|
| Severity | 30 |
| Citizens affected | 25 |
| Location risk (near school/hospital, main road, dense residential) | 20 |
| Duration open vs. SLA target | 15 |
| Report frequency | 10 |

The exact formula lives in `backend/src/services/priorityScoring.js` (mirrored in
`ai-service/app/priority.py` so both services agree). Every case page and the Command Center's priority
queue show the full factor-by-factor breakdown — never an opaque score.

Duplicate reports of the same issue near the same location are automatically consolidated into one case
(`backend/src/services/duplicateDetection.js`), so the priority queue reflects real distinct issues, not
noise.

## What's real vs. simulated in this prototype

- **Real:** the full request lifecycle (submission → AI classification → routing → priority scoring →
  officer workflow → resolution → citizen confirmation), the priority-scoring math, duplicate consolidation,
  JWT auth & roles, the GIS map, analytics, and every UI flow.
- **Simulated, and clearly labelled as such in the UI and API responses:** the NLP/computer-vision models
  (keyword-based mock classifiers standing in for trained models) and the department "connections" in the
  Interoperability Hub. The architecture is built so these are drop-in replacements — see
  `ai-service/README` notes in each module's docstring.

## Tech stack

- **Frontend:** React 18, React Router, Tailwind CSS, Leaflet / react-leaflet (GIS map), Recharts
  (analytics), lucide-react (icons)
- **Backend:** Node.js, Express, JWT auth, bcrypt, an in-memory data store with Mongoose models ready for
  MongoDB
- **AI service:** Python, FastAPI, Pydantic

## Notes for judges / reviewers

- All data is demonstration data for Maharashtra cities, clearly marked `demoData: true` in API responses
  and with on-screen notices — it is not live government data.
- Every screen that could plausibly fail (network errors, empty states, missing data) has a real loading,
  error, and empty state — try disconnecting the backend while the frontend is running to see it.
