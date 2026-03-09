from typing import Any


class PromptOptimizer:
    @staticmethod
    def optimize(prompt: str, context: dict[str, Any] | None = None) -> str:
        cleaned = prompt.strip().rstrip("?.!")
        feature = cleaned.capitalize()

        role = "SaaS product administrators"
        if context and context.get("user_role"):
            role = f"{context['user_role']} users"

        page = context.get("current_page") if context else "the product dashboard"

        return (
            f"Task: Explain how to {feature} in {page}.\n"
            f"Context: User needs in-app guidance to complete the feature successfully.\n"
            f"Audience: {role}.\n"
            "Constraints: Maximum 5 steps, clear action verbs, avoid jargon.\n"
            "Output Format: JSON with title, message, steps."
        )

    @staticmethod
    def as_dict(prompt: str, context: dict[str, Any]) -> dict[str, Any]:
        return {
            "original_prompt": prompt,
            "optimized_prompt": PromptOptimizer.optimize(prompt, context),
            "pendo_context": context,
        }
