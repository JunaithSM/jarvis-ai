from fastapi import FastAPI
from api.routes_run import router as run_router

app = FastAPI(title="jarvis_AI Coding Platform Backend")

@app.get("/")
def home():
    return {"message": "Backend running ✅"}

# include router
app.include_router(run_router)
