from groq import Groq
import json

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

schema_reference = json.dumps(EXPECTED_SYNTAX_EXPERIMENT, indent=2)


with open("backend/trial.json", "r") as f:
    sample_dict = json.load(f)


client = Groq()  # uses GROQ_API_KEY from environment


def ai_assistant(dict_input):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": f"""
You are an educational coding assistant.

STRICT OUTPUT CONTRACT (NON-NEGOTIABLE):
- Output ONLY valid JSON.
- The top-level object MUST be a syntax_experiment.
- DO NOT include hints, explanations, notes, or suggestions.
- DO NOT fix or reference the user's code.
- DO NOT suggest edits or replacements.
- DO NOT include free-form text.

SYNTAX EXPERIMENT RULES:
- Demonstrate correct Python for-loop syntax.
- Use a generic example (not user code).
- Use code_template with {{placeholders}}.
- The ONLY editable placeholders are:
  - loop variable
  - range limit
- DO NOT allow editing of the loop body.

REFERENCE SCHEMA (copy structure, change values only):
{schema_reference}

If you include corrected code, final code, or runnable code, your response is INVALID.
"""
            },
            {
                "role": "user",
                "content": f"""
Language: Python
Error type: for_loop_syntax
User code:
{dict_input}
"""
            }
        ]
    )

    output = response.choices[0].message.content

    print("\nGenerated Post:\n")
    print(output)


ai_assistant(sample_dict)
