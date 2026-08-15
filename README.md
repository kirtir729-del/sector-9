# Sector 9 — Silent Co-Driver

**AI-powered race radio analysis for driver stress and performance state.**

Formula 1 teams track every variable on the car in real time: tire wear, brake temperatures, fuel load, all measured down to the millisecond. The driver, arguably the most important variable in the system, is still monitored almost entirely by ear. Sector 9 closes that gap by turning driver radio communication into structured, quantifiable data the pit wall can actually act on.

**Repository:** https://github.com/kirtir729-del/sector-9
**Built by** Team Poseidon for GrandPrix 2026

---

## Overview

During a race, driver radio carries some of the most valuable signal available to an engineering team: fatigue, stress, confusion, physical strain, and early indicators of declining performance. In practice, almost none of it is captured. Race engineers listen in real time under enormous pressure, with no structured baseline, no historical comparison, and no automated way to flag a developing issue before it becomes costly.

Sector 9 listens to driver radio, live or recorded, and converts it into a set of driver state indicators: stress, fatigue, voice instability, cognitive load, and performance risk. These get surfaced through a race engineering dashboard built for fast decisions under pressure.

The goal isn't to replace the engineer's judgment. It's to give the pit wall a second set of ears that never tires, never misses a subtle shift in tone, and can flag a problem the moment it starts to appear.

---

## Core Features

- **Live Audio Capture** — Streams microphone input directly from the browser to the backend for real-time analysis.
- **Demo Audio Analysis** — Accepts uploaded radio recordings (WAV or MP3) and runs them through the full processing pipeline: transcription, voice analysis, stress analysis, and issue extraction.
- **Driver State Indicators** — Produces five core metrics for every analyzed clip: stress, fatigue, voice instability, cognitive load, and performance risk.
- **Driver Profiles** — Every result is tied to a specific driver, team, car, session, and lap, so insights are never generic.
- **Stress Ranking** — Ranks drivers against one another in real time by stress and performance risk, helping engineers prioritize attention.
- **Stress Analytics** — Visualizes stress, fatigue, and cognitive load across laps and sessions, surfacing trends that would be invisible in any single radio call.
- **Pit Wall Alerts** — Automatically flags significant changes in driver state, like a sudden stress spike or a jump in voice instability, as actionable alerts.
- **Issue Extraction** — Pulls specific reported issues out of driver communication (for example, a mechanical concern) and attaches a severity score, a confidence score, and a recommended action.
- **Session Debrief** — Summarizes a full session after the fact: major stress events, driver state changes, detected issues, and performance risk windows, all in a single report.

---

## System Architecture

```
                          SECTOR 9
                        Silent Co-Driver

        ┌───────────────────────┬───────────────────────┐
        │                       │                       │
        ▼                       │                       ▼
   FRONTEND                     │                  BACKEND
   ─────────                    │                  ────────
   F1 Dashboard                 │                  Flask API
   Driver Profiles              │                  Audio Processing
   Live Audio Interface         │                  AI Models
   Demo Audio Interface         │                  Stress Analysis
   Graphs & Rankings            │                  Transcription & Alerts
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                 │
                                 ▼
                        Analysis Results
```

Frontend and backend are fully decoupled, so each side can be built, tested, and deployed independently.

---

## Project Structure

```
sector-9/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── routes/
│   │   ├── audio.py
│   │   ├── driver.py
│   │   └── analysis.py
│   ├── services/
│   │   ├── audio_processor.py
│   │   ├── stress_analyzer.py
│   │   └── transcription.py
│   ├── models/
│   └── tests/
├── website/
│   ├── index.html
│   ├── style.css
│   ├── css/
│   ├── js/
│   │   ├── app.js
│   │   ├── audio.js
│   │   ├── charts.js
│   │   └── dashboard.js
│   └── assets/
│       └── f1-track.svg
├── api/
├── requirements.txt
├── vercel.json
└── README.md
```

---

## API Reference

### Health Check
`GET /api/health`

```json
{
  "service": "Silent Co-Driver",
  "status": "online",
  "version": "1.0.0"
}
```

### Drivers
`GET /api/drivers`
Returns all available driver information.

### Driver Profile
`GET /api/drivers/<driver_id>`
Returns information for a specific driver.

### Live Audio
`POST /api/audio/live`
Accepts live microphone audio for analysis.

### Demo Audio
`POST /api/audio/demo`
Accepts an uploaded audio file for analysis.

### Session Analysis
`GET /api/analysis/<session_id>`
Returns analysis results for a specific session.

### Stress Ranking
`GET /api/ranking`
Returns driver stress and performance risk rankings.

---

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript, Chart.js, SVG, Web Audio API
- **Backend:** Python, Flask, Flask-CORS, REST API
- **Audio Processing:** NumPy, SciPy, SoundFile, SoXR, Librosa
- **AI and Machine Learning:** Speech-to-text, speech emotion and stress recognition, PyTorch-based models, feature extraction, ML classifiers

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js (if running frontend tooling locally)
- Git

### Backend Setup

```bash
git clone https://github.com/kirtir729-del/sector-9.git
cd sector-9/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # Windows
# source .venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
python app.py
```

The backend runs at `http://127.0.0.1:5000`. Verify it's live:

```bash
curl http://127.0.0.1:5000/api/health
```

### Frontend Setup

The dashboard lives in `website/` and includes the F1-inspired interface, audio controls, analytics, driver profiles, and visualization components. During local development it talks to the local Flask backend directly, no extra build step required.

---

## Project Status

**Completed:**
F1-inspired dashboard and driver profile interface, live audio and demo audio interfaces, dashboard visualization components, Flask backend foundation with health/driver/ranking endpoints, and a collaborative GitHub development workflow.

**In Progress:**
Live and demo audio processing pipelines, speech transcription, stress/fatigue/voice instability/cognitive load detection, performance risk estimation, full frontend-backend integration, and production deployment.

---

## Roadmap

- Real-time streaming audio analysis
- Advanced speech emotion recognition
- Driver-specific baseline modeling with personalized stress thresholds
- Multi-driver race monitoring with historical session comparison
- Race-wide stress heatmaps
- Automated engineering recommendations and anomaly detection
- Predictive performance risk modeling
- Telemetry and lap-time correlation
- Multi-language radio transcription
- Cloud-based model inference

---

## Team Poseidon

- **Katyayani** — AI/ML & Frontend
- **Hajira** — Backend & AI Analysis
- **Aryaman** — Documentation, Technical Communication & Presentation
- **Yuvraj** — Frontend, Integration & Demo

---

## Disclaimer

Sector 9 is a research and prototype project built for demonstration and hackathon development. Stress, fatigue, cognitive load, and performance risk outputs are AI-generated estimates and should not be treated as medical, psychological, or definitive assessments.

---

## License

Released under the MIT License.
