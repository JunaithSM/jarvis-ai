from groq import Groq
from src.config.env import GROQ_API_KEY
from src.prompts.logical_prompt import SOCRATIC_SYSTEM_PROMPT


# =========================
# ENV + CLIENT SETUP
# =========================

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. Check backend/src/config/env.py or your .env file."
    )

client = Groq(api_key=GROQ_API_KEY)
# =========================
# SOCRATIC ASSISTANT
# =========================

def socratic_hint_assistant(question: str, code: str) -> dict:
    """
    Returns a Socratic hint based on the user's question and code.
    """

    user_prompt = f"""
The user has a programming doubt.

User question:
{question}

User code:
{code}

Give a Socratic hint to help the user discover the issue themselves.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SOCRATIC_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.5
    )

    return {
        "type": "socratic_hint",
        "hint": response.choices[0].message.content.strip()
    }
