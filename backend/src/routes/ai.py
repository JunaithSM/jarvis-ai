from fastapi import APIRouter
from pydantic import BaseModel

from backend.src.services.ai import socratic_hint_assistant

router = APIRouter()


# =========================
# REQUEST / RESPONSE MODELS
# =========================

class SocraticHintRequest(BaseModel):
    question: str
    code: str


class SocraticHintResponse(BaseModel):
    type: str
    hint: str


# =========================
# ENDPOINT
# =========================

@router.post("/ai/socratic-hint", response_model=SocraticHintResponse)
def socratic_hint(payload: SocraticHintRequest):
    """
    Called when user asks a doubt and clicks Send.
    Sends question + full code to AI.
    Returns Socratic hint only.
    """
    return socratic_hint_assistant(
        question=payload.question,
        code=payload.code
    )
