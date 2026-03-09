from typing import Any


class PendoContextService:
    @staticmethod
    def get_simulated_context() -> dict[str, Any]:
        return {
            "user_role": "Admin",
            "current_page": "Analytics Dashboard",
            "feature_clicked": "Export Reports",
            "experience_level": "Intermediate",
            "account_tier": "Enterprise",
            "last_action": "Opened report filters",
        }

    @staticmethod
    def build_prompt_with_context(optimized_prompt: str, context: dict[str, Any]) -> str:
        return (
            "You are generating guidance for Pendo In-App Guides. "
            "Use the prompt and context to produce concise, actionable instructions.\n\n"
            f"Optimized Prompt:\n{optimized_prompt}\n\n"
            f"Pendo Product Context:\n{context}\n\n"
            "Return strict JSON with keys: title, message, steps."
        )
