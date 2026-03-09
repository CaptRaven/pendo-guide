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
            f"Task: Build a tooltip walkthrough journey that teaches users to write better prompts for {feature} in {page}.\n"
            f"Context: User needs in-app coaching to turn vague prompts into structured prompts (Task, Context, Audience, Constraints, Output Format).\n"
            f"Audience: {role}.\n"
            "Constraints: Maximum 5 tooltip steps, concise copy, realistic selectors, avoid jargon, include practical prompting tips.\n"
            "Output Format: JSON with guide_type, title, message, steps where each step has selector, tooltip_title, tooltip_body, position, action."
        )

    @staticmethod
    def as_dict(prompt: str, context: dict[str, Any]) -> dict[str, Any]:
        return {
            "original_prompt": prompt,
            "optimized_prompt": PromptOptimizer.optimize(prompt, context),
            "pendo_context": context,
        }
