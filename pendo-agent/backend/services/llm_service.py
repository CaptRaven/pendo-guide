import json
import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv


class LLMServiceError(Exception):
    pass


class LLMService:
    def __init__(self) -> None:
        backend_dir = Path(__file__).resolve().parents[1]
        load_dotenv(backend_dir / ".env", override=False)
        load_dotenv(backend_dir / ".env.example", override=False)

        self.api_key = os.getenv("MISTRAL_API_KEY", "")
        self.base_url = os.getenv("MISTRAL_BASE_URL", "https://api.mistral.ai/v1")
        self.model = os.getenv("MISTRAL_MODEL", "mistral-small-latest")

    @staticmethod
    def _normalize_guide(raw: dict[str, Any]) -> dict[str, Any]:
        title = str(raw.get("title", "")).strip()
        message = str(raw.get("message", "")).strip()
        steps = raw.get("steps", [])
        if not isinstance(steps, list):
            steps = [str(steps)]
        steps = [str(s).strip() for s in steps if str(s).strip()][:5]

        title_words = title.split()
        if len(title_words) > 8:
            title = " ".join(title_words[:8])

        message_words = message.split()
        if len(message_words) > 40:
            message = " ".join(message_words[:40])

        return {"title": title, "message": message, "steps": steps}

    async def generate_guide(self, prompt_with_context: str) -> dict[str, Any]:
        if not self.api_key:
            raise LLMServiceError(
                "MISTRAL_API_KEY is missing. Add it to backend/.env (or backend/.env.example)."
            )

        system_prompt = (
            "You create Pendo In-App Guide content. Output strict JSON only, no markdown. "
            "JSON schema: {\"title\": string, \"message\": string, \"steps\": string[]}. "
            "Constraints: title under 8 words, message under 40 words, max 5 steps."
        )

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt_with_context},
            ],
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions", json=payload, headers=headers
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                if isinstance(content, str):
                    cleaned = content.strip().replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(cleaned)
                else:
                    parsed = content
                return self._normalize_guide(parsed)
        except httpx.HTTPStatusError as exc:
            raise LLMServiceError(
                f"Mistral API returned {exc.response.status_code}: {exc.response.text[:300]}"
            ) from exc
        except json.JSONDecodeError as exc:
            raise LLMServiceError(
                "Mistral response was not valid JSON in the expected schema."
            ) from exc
        except Exception as exc:
            raise LLMServiceError(f"Guide generation failed: {str(exc)}") from exc
