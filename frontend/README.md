# Pit Wall Command

I have an existing Formula 1 AI driver-state analysis project called Sector 9 — Silent Co-Driver.

I want you to build/improve the frontend dashboard for this existing project.

The frontend should include:

- F1-inspired dark racing dashboard

- Driver profile and driver selection

- Live audio analysis interface

- Demo audio upload interface

- Stress, fatigue, voice instability, cognitive load and performance risk cards

- Driver stress ranking

- Stress analytics charts

- Pit wall alerts

- Issue extraction

- Session debrief

- Responsive desktop interface

IMPORTANT:

Do not replace or modify my Flask backend architecture.

The backend API is in api/index.py.

Use these API endpoints:

GET /api/health

GET /api/drivers

GET /api/drivers/<driver_id>

POST /api/audio/live

POST /api/audio/demo

GET /api/ranking

POST /api/debrief

The frontend must call these APIs rather than using fake hardcoded API responses.

Keep the project structure clean and make the frontend production-ready.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://driver-focus.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/14a0fa4a-43e6-4513-8d3c-4e92cd40aef7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
