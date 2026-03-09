from typing import Any


class ResponseCritic:
    @staticmethod
    def _steps_text(steps: list[Any]) -> str:
        parts: list[str] = []
        for step in steps:
            if isinstance(step, dict):
                parts.extend(
                    [
                        str(step.get("selector", "")),
                        str(step.get("tooltip_title", "")),
                        str(step.get("tooltip_body", "")),
                    ]
                )
            else:
                parts.append(str(step))
        return " ".join(parts)

    @staticmethod
    def _score_clarity(guide: dict[str, Any]) -> int:
        title = guide.get("title", "")
        message = guide.get("message", "")
        steps = guide.get("steps", [])
        if not title or not message or not isinstance(steps, list) or len(steps) == 0:
            return 2
        if len(title.split()) <= 8 and len(message.split()) <= 40 and len(steps) <= 5:
            return 4
        return 3

    @staticmethod
    def _score_relevance(guide: dict[str, Any], context: dict[str, Any]) -> int:
        combined = " ".join(
            [guide.get("title", ""), guide.get("message", ""), ResponseCritic._steps_text(guide.get("steps", []))]
        ).lower()
        hits = 0
        for key in ["current_page", "feature_clicked", "user_role"]:
            value = str(context.get(key, "")).lower()
            if value and any(token in combined for token in value.split()):
                hits += 1
        if hits >= 2:
            return 3
        if hits == 1:
            return 2
        return 1

    @staticmethod
    def _score_completeness(guide: dict[str, Any]) -> int:
        steps = guide.get("steps", [])
        if not isinstance(steps, list):
            return 1

        well_formed = 0
        for step in steps:
            if isinstance(step, dict) and step.get("tooltip_body") and step.get("selector"):
                well_formed += 1

        if 2 <= len(steps) <= 5 and well_formed == len(steps):
            return 3
        if 2 <= len(steps) <= 5:
            return 2
        if len(steps) == 1:
            return 2
        return 1

    @classmethod
    def evaluate(cls, guide: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        clarity = cls._score_clarity(guide)
        relevance = cls._score_relevance(guide, context)
        completeness = cls._score_completeness(guide)

        raw = clarity + relevance + completeness
        normalized = max(1, min(10, round((raw / 10) * 10)))

        feedback = (
            f"clarity={clarity}/4, relevance={relevance}/3, completeness={completeness}/3"
        )

        return {
            "score": normalized,
            "feedback": feedback,
            "needs_regeneration": normalized < 7,
        }
