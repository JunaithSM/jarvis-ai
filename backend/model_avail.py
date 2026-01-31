from groq import Groq

print("Connecting to Groq...")

client = Groq(api_key="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")

models = client.models.list()

print("Available models:")
for m in models.data:
    print(m.id)
