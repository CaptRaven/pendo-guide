# Pendo Prompt Optimization Agent

A prototype AI system that optimizes vague user prompts, injects simulated Pendo context, generates guide content with an LLM, critiques output quality, and returns structured responses suitable for Pendo In-App Guides.

## Architecture

```text
User Prompt
   |
   v
Prompt Optimizer Agent
   |
   v
Pendo Context Injection
   |
   v
LLM Guide Generator (Mistral API)
   |
   v
Response Critic Agent
   |
   +-- score < 7 -> Regenerate once
   |
   v
Final Structured Guide JSON
```

## Project Structure

```text
pendo-agent/
  backend/
    main.py
    requirements.txt
    agents/
      prompt_optimizer.py
      response_critic.py
    services/
      llm_service.py
      pendo_context_service.py
    api/
      routes.py
    schemas/
      request_models.py
      response_models.py
  frontend/
    package.json
    index.html
    vite.config.js
    src/
      App.jsx
      main.jsx
      styles.css
      components/
        PromptInput.jsx
        GuideDisplay.jsx
```

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export MISTRAL_API_KEY="<your_mistral_api_key>"
uvicorn main:app --reload --port 8000
```

Or copy `.env.example` to `.env` in `backend/` and set values there.

Optional env vars:
- `MISTRAL_BASE_URL` (default: `https://api.mistral.ai/v1`)
- `MISTRAL_MODEL` (default: `mistral-small-latest`)

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Or copy `.env.example` to `.env` in `frontend/`.

Optional env var:
- `VITE_API_BASE` (default: `http://localhost:8000`)

## Host It Live

### Option A (Recommended): Render (backend) + Vercel (frontend)

#### 1) Push repo to GitHub

```bash
cd /path/to/pendo-agent
git init
git add .
git commit -m "Initial pendo-agent prototype"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

#### 2) Deploy backend on Render

Render can read `render.yaml` at repo root.

- Create a new Blueprint in Render and connect your GitHub repo.
- Confirm service `pendo-agent-backend` is detected.
- Set env vars in Render dashboard:
  - `MISTRAL_API_KEY` = your key
  - `FRONTEND_ORIGIN` = your frontend URL (set after Vercel deploy, then update)
- Deploy and copy backend URL, e.g. `https://pendo-agent-backend.onrender.com`

Health check:

```bash
curl https://<your-render-backend>/health
```

#### 3) Deploy frontend on Vercel

- Import the same GitHub repo into Vercel.
- Set Root Directory to `frontend`.
- Framework preset: `Vite`.
- Build command: `npm run build`
- Output directory: `dist`
- Add env var:
  - `VITE_API_BASE` = your Render backend URL
- Deploy and copy frontend URL, e.g. `https://pendo-agent.vercel.app`

#### 4) Final CORS wiring

- Go back to Render backend env vars.
- Set `FRONTEND_ORIGIN=https://<your-vercel-frontend>`
- Redeploy backend.

### Option B: Single host with Docker

You can also deploy backend using any Docker-compatible host (Railway/Fly.io/Render Docker service) with:
- `backend/Dockerfile`
- `backend/Procfile`
- `backend/runtime.txt`
- `backend/requirements.txt`

## API Endpoints

### `POST /optimize-prompt`
Request:
```json
{
  "prompt": "how do i export reports"
}
```

Response:
```json
{
  "original_prompt": "how do i export reports",
  "optimized_prompt": "Task: Explain how to How do i export reports in Analytics Dashboard.\nContext: User needs in-app guidance to complete the feature successfully.\nAudience: Admin users.\nConstraints: Maximum 5 steps, clear action verbs, avoid jargon.\nOutput Format: JSON with title, message, steps.",
  "pendo_context": {
    "user_role": "Admin",
    "current_page": "Analytics Dashboard",
    "feature_clicked": "Export Reports",
    "experience_level": "Intermediate",
    "account_tier": "Enterprise",
    "last_action": "Opened report filters"
  }
}
```

### `POST /generate-guide`
Request:
```json
{
  "prompt": "how do i export reports"
}
```

Response:
```json
{
  "original_prompt": "how do i export reports",
  "optimized_prompt": "...",
  "pendo_context": {"...": "..."},
  "guide_output": {
    "guide_type": "walkthrough",
    "title": "Export Reports Quickly",
    "message": "Follow this walkthrough to export analytics reports.",
    "steps": [
      {
        "selector": "#nav-analytics",
        "tooltip_title": "Open Analytics",
        "tooltip_body": "Click Analytics to open the reports dashboard.",
        "position": "right",
        "action": "click"
      },
      {
        "selector": "#export-reports-btn",
        "tooltip_title": "Start Export",
        "tooltip_body": "Select Export Reports to begin file export.",
        "position": "bottom",
        "action": "click"
      }
    ]
  },
  "critic_score": 8,
  "critic_feedback": "clarity=4/4, relevance=2/3, completeness=3/3",
  "regenerated": false
}
```

## Example Prompts
- `explain exporting`
- `how do i setup onboarding guide`
- `help users find dashboard insights`

## Notes
- Guide generation is API-driven through Mistral. If `MISTRAL_API_KEY` is missing/invalid or the API fails, `/generate-guide` returns an error with details.
- Guide constraints enforced: title under 8 words, message under 40 words, max 5 tooltip steps.
- CORS is controlled with `FRONTEND_ORIGIN` (comma-separated allowed origins).
