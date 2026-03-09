from typing import Any

from pydantic import BaseModel, Field


class GuideStep(BaseModel):
    selector: str = Field(default="")
    tooltip_title: str = Field(default="")
    tooltip_body: str = Field(default="")
    position: str = Field(default="auto")
    action: str = Field(default="click")


class GuideOutput(BaseModel):
    guide_type: str = Field(default="walkthrough")
    title: str = Field(default="")
    message: str = Field(default="")
    steps: list[GuideStep] = Field(default_factory=list)


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
