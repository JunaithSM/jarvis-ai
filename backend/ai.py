from groq import Groq
import json

# =========================
# CLIENT
# =========================

client = Groq(Groq_api_key="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")  # uses GROQ_API_KEY from environment


# =========================
# SCHEMA (SYNTAX EXPERIMENT)
# =========================

EXPECTED_SYNTAX_EXPERIMENT = {
    "type": "syntax_experiment",
    "language": "python",
    "code_template": "for {{var}} in range({{limit}}):\n    print({{var}})",
    "editable_fields": {
        "var": {
            "default": "i",
            "description": "Loop variable name"
        },
        "limit": {
            "default": 5,
            "min": 1,
            "max": 20,
            "description": "Number of iterations"
        }
    }
}

SCHEMA_REFERENCE = json.dumps(EXPECTED_SYNTAX_EXPERIMENT, indent=2)


# =========================
# SYSTEM PROMPTS
# =========================

SYNTAX_SYSTEM_PROMPT = f"""
You are an educational coding assistant.

STRICT OUTPUT CONTRACT (NON-NEGOTIABLE):
- Output ONLY valid JSON.
- The top-level object MUST be a syntax_experiment.
- DO NOT include hints, explanations, notes, or suggestions.
- DO NOT fix or reference the user's code.
- DO NOT include free-form text.

SYNTAX EXPERIMENT RULES:
- Demonstrate correct Python for-loop syntax.
- Use a generic example (not the user code).
- Use code_template with {{placeholders}}.
- Editable placeholders:
  - loop variable
  - range limit
- DO NOT allow editing of the loop body.

REFERENCE SCHEMA (copy structure, change values only):
{SCHEMA_REFERENCE}
"""


SOCRATIC_SYSTEM_PROMPT = """
You are a Socratic coding tutor.

RULES:
- DO NOT write code.
- DO NOT show syntax.
- DO NOT give direct answers.
- ONLY ask guiding questions or give thinking hints.
- Focus on reasoning, boundaries, and conditions.
- Keep hints short and clear.
"""


# =========================
# AI FUNCTIONS
# =========================

def syntax_experiment_assistant(user_code: str):
    """
    Returns STRICT syntax_experiment JSON.
    """
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": SYNTAX_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"""
Language: Python
User code:
{user_code}
"""
            }
        ]
    )

    return response.choices[0].message.content


def socratic_hint_assistant(user_question: str):
    """
    Returns logical Socratic hints only.
    """
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": SOCRATIC_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_question
            }
        ]
    )

    return {
        "type": "socratic_hint",
        "response": response.choices[0].message.content
    }
