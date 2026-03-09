from typing import Any

from pydantic import BaseModel, Field


class GuideOutput(BaseModel):
    title: str = Field(default="")
    message: str = Field(default="")
    steps: list[str] = Field(default_factory=list)


class OptimizePromptResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    pendo_context: dict[str, Any]


class GenerateGuideResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    pendo_context: dict[str, Any]
    guide_output: GuideOutput
    critic_score: int
    critic_feedback: str
    regenerated: bool
