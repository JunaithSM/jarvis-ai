from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from src.services.compiler_engine import compile_and_run


router = APIRouter()


class RunRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""


@router.post("/run/{sessionId}")
def run_code(sessionId: str, payload: RunRequest):
    if not sessionId:
        raise HTTPException(status_code=400, detail="sessionId missing")

    result = compile_and_run(
        session_id=sessionId,
        language=payload.language,
        code=payload.code,
        stdin=payload.stdin or ""
    )

    return result
