import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router

app = FastAPI(title="Pendo Prompt Optimization Agent", version="0.1.0")

frontend_origin_env = os.getenv("FRONTEND_ORIGIN", "*")
allowed_origins = [
    o.strip().rstrip("/") for o in frontend_origin_env.split(",") if o.strip()
]
if not allowed_origins:
    allowed_origins = ["*"]
use_wildcard = "*" in allowed_origins
origin_regex = os.getenv("FRONTEND_ORIGIN_REGEX")

# Helpful default for Vercel deployments to avoid exact-origin mismatches.
if not use_wildcard and not origin_regex and any(
    origin.endswith(".vercel.app") for origin in allowed_origins
):
    origin_regex = r"^https://.*\.vercel\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    # API uses Bearer/key-based auth and does not require cookies.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
