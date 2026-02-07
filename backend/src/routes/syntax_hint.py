from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.services.syntax_templates import SYNTAX_TEMPLATES

router = APIRouter()


# =========================
# REQUEST / RESPONSE MODELS
# =========================

class SyntaxRequest(BaseModel):
    key: str


class SyntaxResponse(BaseModel):
    type: str
    title: str
    description: str
    syntax: str
    example: str


# =========================
# ENDPOINT
# =========================

@router.post("/syntax/get", response_model=SyntaxResponse)
def get_syntax(payload: SyntaxRequest):
    """
    Called when user clicks a syntax button (for_loop, while_loop, etc.)
    Returns predefined syntax reference.
    """

    syntax_data = SYNTAX_TEMPLATES.get(payload.key)

    if not syntax_data:
        raise HTTPException(
            status_code=404,
            detail="Syntax template not found"
        )

    return {
        "type": "syntax_reference",
        "title": syntax_data["title"],
        "description": syntax_data["description"],
        "syntax": syntax_data["syntax"],
        "example": syntax_data["example"]
    }
