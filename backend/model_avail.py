from groq import Groq
from src.config.env import GROQ_API_KEY

print("Connecting to Groq...")

client = Groq(api_key=GROQ_API_KEY)

models = client.models.list()

print("Available models:")
for m in models.data:
    print(m.id)
