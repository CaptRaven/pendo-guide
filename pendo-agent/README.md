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
    "title": "Export Reports Quickly",
    "message": "Follow these steps to export analytics reports from the dashboard.",
    "steps": [
      "Open the Analytics Dashboard.",
      "Apply the report filters you need.",
      "Click Export Reports in the top toolbar.",
      "Choose CSV or PDF format.",
      "Confirm and download the file."
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
- Guide constraints enforced: title under 8 words, message under 40 words, max 5 steps.
