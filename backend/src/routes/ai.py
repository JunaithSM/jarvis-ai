from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict

from src.services.ai import socratic_hint_assistant

router = APIRouter()


# =========================
# REQUEST / RESPONSE MODELS
# =========================

class SocraticHintRequest(BaseModel):
    question: str
    code: str

    previous_question: Optional[str] = None
    previous_code: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None


class SocraticHintResponse(BaseModel):
    type: str
    hint: str
    user_is_stuck: bool | None = None


# =========================
# ENDPOINT
# =========================

@router.post("/ai/socratic-hint", response_model=SocraticHintResponse)
def socratic_hint(payload: SocraticHintRequest):
    """
    Called when user asks a doubt and clicks Send.
    Sends question + code + minimal context to AI.
    """

    return socratic_hint_assistant(
        question=payload.question,
        code=payload.code,
        history=payload.history,
        previous_question=payload.previous_question,
        previous_code=payload.previous_code
    )
