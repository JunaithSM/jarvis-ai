from typing import List, Dict, Optional

from groq import Groq
from src.config.env import GROQ_API_KEY
from src.prompts.logical_prompt import SOCRATIC_SYSTEM_PROMPT


# =========================
# CLIENT SETUP
# =========================

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. Check backend/src/config/env.py or your .env file."
    )

client = Groq(api_key=GROQ_API_KEY)


# =========================
# TYPES
# =========================

Message = Dict[str, str]  # {"role": "system" | "user" | "assistant", "content": str}


# =========================
# STUCK DETECTION
# =========================

def detect_user_stuck(
    previous_question: Optional[str],
    previous_code: Optional[str],
    current_question: str,
    current_code: str
) -> bool:
    """
    Heuristically determines whether the user is stuck.
    """

    # First interaction → not stuck
    if not previous_question:
        return False

    # Same code again (ignoring whitespace)
    if previous_code and previous_code.strip() == current_code.strip():
        return True

    # Repeated confusion phrases
    stuck_phrases = [
        "still",
        "not working",
        "again",
        "i don't know",
        "what now",
        "why",
        "??"
    ]

    current_lower = current_question.lower()
    return any(phrase in current_lower for phrase in stuck_phrases)


# =========================
# PROMPT BUILDERS
# =========================

def build_user_prompt(question: str, code: str) -> str:
    """
    Builds the current user prompt.
    """
    return f"""
IMPORTANT:
Reply in the same language and mixing style as the user's question below.

User question:
{question}

User code:
{code}

Give a Socratic hint to help the user discover the issue themselves.
""".strip()


def build_messages(
    user_prompt: str,
    history: Optional[List[Message]] = None,
    user_is_stuck: bool = False
) -> List[Message]:
    """
    Builds the final message list sent to the LLM.
    """

    messages: List[Message] = [
        {"role": "system", "content": SOCRATIC_SYSTEM_PROMPT}
    ]

    if history:
        messages.extend(history)

    if user_is_stuck:
        messages.append({
            "role": "system",
            "content": (
                "The user appears stuck after previous hints. "
                "Increase clarity slightly compared to earlier responses, "
                "but do NOT provide the final solution or direct syntax."
            )
        })

    messages.append({"role": "user", "content": user_prompt})
    return messages


# =========================
# MAIN ASSISTANT FUNCTION
# =========================

def socratic_hint_assistant(
    question: str,
    code: str,
    history: Optional[List[Message]] = None,
    previous_question: Optional[str] = None,
    previous_code: Optional[str] = None
) -> Dict[str, str]:
    """
    Returns a Socratic hint based on the user's question and code.
    """

    user_is_stuck = detect_user_stuck(
        previous_question=previous_question,
        previous_code=previous_code,
        current_question=question,
        current_code=code
    )

    user_prompt = build_user_prompt(question, code)

    messages = build_messages(
        user_prompt=user_prompt,
        history=history,
        user_is_stuck=user_is_stuck
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.5
    )

    return {
        "type": "socratic_hint",
        "hint": response.choices[0].message.content.strip(),
        "user_is_stuck": user_is_stuck
    }
