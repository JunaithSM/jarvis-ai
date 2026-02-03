from fastapi import FastAPI
from pydantic import BaseModel

from backend.ai import (
    syntax_experiment_assistant,
    socratic_hint_assistant
)

app = FastAPI(title="AI Tutor API")


# =========================
# REQUEST MODELS
# =========================

class SyntaxHintRequest(BaseModel):
    code: str


class SocraticHintRequest(BaseModel):
    question: str


# =========================
# ENDPOINTS
# =========================

@app.post("/syntax-hint")
def syntax_hint(payload: SyntaxHintRequest):
    """
    Called ONLY when user clicks the Hint button.
    """
    return syntax_experiment_assistant(payload.code)


@app.post("/chat-hint")
def chat_hint(payload: SocraticHintRequest):
    """
    Called ONLY when user sends a doubt via chatbot.
    """
    return socratic_hint_assistant(payload.question)
