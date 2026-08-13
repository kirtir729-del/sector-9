# Sector 9 — Silent Co-Driver
## AI Powered F1 Radio Stress and Driver State Analysis Platform

> The driver talks. Sector 9 listens. The pit wall understands.

**Live Demo:** ADD YOUR DEPLOYED WEBSITE LINK HERE  
**Repository:** https://github.com/kirtir729-del/sector-9  
**Built by Team EVOX for GrandPrix 2026**

---

## Problem Statement

During a Formula 1 race, driver radio communication carries some of the most valuable information available to a race team: fatigue, stress, confusion, physical strain, and early signs of performance decline. In practice, this information is almost entirely lost. Engineers are listening in real time under immense pressure, with no structured way to detect subtle vocal changes, no historical baseline for comparison, and no automated way to flag a developing issue before it becomes a costly one.

Formula 1 already uses telemetry to monitor the car in extraordinary detail. The driver, arguably the most important variable in the system, is monitored almost entirely by ear.

## Objective

Sector 9 exists to close that gap. The platform listens to driver radio communication, whether live or recorded, and converts it into structured, quantifiable driver state data. It estimates stress, fatigue, voice instability, cognitive load, and performance risk, then presents these insights through a race engineering dashboard built for fast, high pressure decision making.

The goal is not to replace human judgment on the pit wall. It is to give engineers a second set of ears that never gets tired, never misses a subtle shift in tone, and can flag a problem the moment it starts to appear.

## What Sector 9 Does

### Live Audio Testing
Captures microphone input directly in the browser and streams it to the backend for real time analysis.

### Demo Audio Analysis
Accepts uploaded radio recordings in WAV or MP3 format and runs them through the full processing pipeline: transcription, voice analysis, stress analysis, and issue extraction.

### Driver State Analysis
Generates five core indicators for every analyzed clip:
- Stress
- Fatigue
- Voice instability
- Cognitive load
- Performance risk

### Driver Identity and Profiles
Associates every analysis result with a specific driver, team, car, session, and lap, so insights are never generic.

### Stress Ranking
Compares drivers against one another in real time, ranking them by stress and performance risk to help engineers prioritize attention.

### Stress Analytics
Visualizes stress, fatigue, and cognitive load over time and across laps, revealing trends that would be invisible in a single radio call.

### Pit Wall Alerts
Automatically surfaces significant changes in driver state, such as a sudden stress spike or a jump in voice instability, as actionable alerts.

### Issue Extraction
Pulls specific reported issues out of driver communication, such as a mechanical concern, and attaches a severity score, a confidence score, and a recommended engineering action.

### Session Debrief
Summarizes an entire session after the fact, combining major stress events, driver state changes, detected issues, and performance risk periods into a single report.

---

## System Architecture

```text
SECTOR 9
SILENT CO-DRIVER

+-------------------------+-------------------------+
|                         |                         |
v                         v
FRONTEND                 BACKEND
|                         |
| F1 Dashboard            | Flask API
| Driver Profile          | Audio Processing
| Live Audio              | AI Models
| Demo Audio              | Stress Analysis
| Graphs                  | Transcription
| Rankings                | Alerts
|                         |
+-------------------------+-------------------------+
                          |
                          v
                    Analysis Results
```

The frontend and backend are fully separated, allowing both teams to build, test, and deploy independently.

---

## Project Structure

```text
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

**GET** `/api/health`

```json
{
  "service": "Silent Co-Driver",
  "status": "online",
  "version": "1.0.0"
}
```

### Drivers

**GET** `/api/drivers`

Returns all available driver information.

### Driver Profile

**GET** `/api/drivers/<driver_id>`

Returns information for a specific driver.

### Live Audio

**POST** `/api/audio/live`

Receives live microphone audio for analysis.

### Demo Audio

**POST** `/api/audio/demo`

Accepts an uploaded audio file for analysis.

### Session Analysis

**GET** `/api/analysis/<session_id>`

Returns analysis results for a specific session.

### Stress Ranking

**GET** `/api/ranking`

Returns driver stress and performance risk rankings.

---

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js
- SVG
- Web Audio API

### Backend
- Python
- Flask
- Flask CORS
- REST API

### Audio Processing
- NumPy
- SciPy
- SoundFile
- SoXR
- Librosa

### AI and Machine Learning
- Speech to text
- Speech emotion and stress recognition
- PyTorch based models
- Feature extraction
- Machine learning classifiers

---

## Running the Backend Locally

```bash
git clone https://github.com/kirtir729-del/sector-9.git
cd sector-9/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The backend runs at:

```text
http://127.0.0.1:5000
```

Test it with:

```bash
curl http://127.0.0.1:5000/api/health
```

---

## Running the Frontend Locally

The dashboard lives in the `website/` directory and includes the F1 inspired interface, audio controls, analytics, driver information, and visualization components. During local development it communicates with the local Flask backend.

---

## Current Development Status

### Completed
- F1 inspired dashboard
- Driver dashboard interface
- Driver identity interface
- Live audio interface
- Demo audio interface
- Dashboard visualization
- Flask backend foundation
- Health API
- Driver API foundation
- Ranking API foundation
- GitHub collaborative development structure

### In Development
- Live audio processing
- Demo audio processing
- Speech transcription
- Stress detection
- Fatigue detection
- Voice instability analysis
- Cognitive load estimation
- Performance risk estimation
- Full frontend backend integration
- Production backend deployment

---

## Future Scope

- Real time streaming audio analysis
- Advanced speech emotion recognition
- Driver specific baseline modeling
- Personalized stress thresholds
- Multi driver race monitoring
- Historical session comparison
- Race wide stress heatmaps
- Automated engineering recommendations
- Advanced anomaly detection
- Predictive performance risk modeling
- Telemetry integration
- Lap time correlation
- Multi language radio transcription
- Cloud based model inference

---

## Team EVOX

- **Katyayani** — Machine Learning and Voice Analysis
- **Hajira** — AI, Backend, and Frontend
- **Yuvraj** — Integration and Demo
- **Aryaman** — Documentation and Presentation

---

## Disclaimer

Sector 9 is a research and prototype project built for demonstration, experimentation, and hackathon development. Stress, fatigue, cognitive load, and performance risk outputs are AI generated estimates and should not be treated as medical, psychological, or definitive assessments.

---

## Submission Checklist

> The following items were included in the provided README as items still needing completion. Remove this section once everything is resolved.

1. **Live Demo Link** — currently a placeholder at the top of this README. Add your deployed Vercel or hosting URL as soon as it is live. A working link is one of the highest impact things you can add for judging.

2. **Frontend Backend Integration** — the README currently states this is still in development. Update the Completed and In Development lists as soon as live audio and demo audio processing are actually wired end to end.

3. **Screenshots or a Short Demo GIF** — judges respond strongly to visuals. Add 2 to 4 dashboard screenshots or a 15 to 30 second GIF near the top of the README, right under the tagline.

4. **Confirm the API responses** shown here match your actual backend output once analysis is implemented, especially the ranking and analysis endpoints, which are currently placeholders based on planned structure.

5. **Add a License section** once you decide on one. MIT is a common and safe default for hackathon projects.

6. **Add a short "How to Run the Full Project" section** once frontend and backend are integrated, so judges can test it themselves in under two minutes.

7. **Double check the GitHub repository link** is public and accessible before submission.

8. **Consider adding a one minute pitch video link** if your hackathon allows it; this consistently increases judge engagement.
