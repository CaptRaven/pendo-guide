from fastapi import APIRouter, HTTPException

from agents.prompt_optimizer import PromptOptimizer
from agents.response_critic import ResponseCritic
from schemas.request_models import PromptRequest
from schemas.response_models import GenerateGuideResponse, OptimizePromptResponse
from services.llm_service import LLMService, LLMServiceError
from services.pendo_context_service import PendoContextService

router = APIRouter()
llm_service = LLMService()


@router.post("/optimize-prompt", response_model=OptimizePromptResponse)
async def optimize_prompt(request: PromptRequest) -> OptimizePromptResponse:
    context = PendoContextService.get_simulated_context()
    optimized_prompt = PromptOptimizer.optimize(request.prompt, context)
    return OptimizePromptResponse(
        original_prompt=request.prompt,
        optimized_prompt=optimized_prompt,
        pendo_context=context,
    )


@router.post("/generate-guide", response_model=GenerateGuideResponse)
async def generate_guide(request: PromptRequest) -> GenerateGuideResponse:
    context = PendoContextService.get_simulated_context()
    optimized_prompt = PromptOptimizer.optimize(request.prompt, context)
    prompt_with_context = PendoContextService.build_prompt_with_context(optimized_prompt, context)

    try:
        guide = await llm_service.generate_guide(prompt_with_context)
    except LLMServiceError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    critique = ResponseCritic.evaluate(guide, context)
    regenerated = False

    if critique["needs_regeneration"]:
        regenerated = True
        strengthened_prompt = (
            prompt_with_context
            + "\n\nPrevious output quality was low. Improve clarity, relevance, and completeness."
        )
        try:
            guide = await llm_service.generate_guide(strengthened_prompt)
        except LLMServiceError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc
        critique = ResponseCritic.evaluate(guide, context)

    return GenerateGuideResponse(
        original_prompt=request.prompt,
        optimized_prompt=optimized_prompt,
        pendo_context=context,
        guide_output=guide,
        critic_score=critique["score"],
        critic_feedback=critique["feedback"],
        regenerated=regenerated,
    )
