from typing import Any


class PendoContextService:
    @staticmethod
    def get_simulated_context() -> dict[str, Any]:
        return {
            "user_role": "Admin",
            "current_page": "Prompt Studio",
            "feature_clicked": "Prompt Optimizer",
            "experience_level": "Beginner",
            "account_tier": "Enterprise",
            "last_action": "Entered a vague prompt",
            "ui_selectors": {
                "prompt_input": "#prompt-input",
                "task_field": "#task-field",
                "context_field": "#context-field",
                "output_format_field": "#output-format-field",
                "generate_button": "#generate-guide-btn",
            },
        }

    @staticmethod
    def build_prompt_with_context(optimized_prompt: str, context: dict[str, Any]) -> str:
        return (
            "You are generating guidance for Pendo In-App Guides. "
            "Use the prompt and context to produce a tooltip walkthrough journey.\n\n"
            f"Optimized Prompt:\n{optimized_prompt}\n\n"
            f"Pendo Product Context:\n{context}\n\n"
            "Return strict JSON with keys: guide_type, title, message, steps. "
            "Each step must include selector, tooltip_title, tooltip_body, position, action."
        )
