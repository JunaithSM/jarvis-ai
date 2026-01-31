from fastapi import FastAPI
from src.routes.routes_run import router as run_router

app = FastAPI(title="jarvis_AI Coding Platform Backend")

@app.get("/")
def home():
    return {"message": "Backend running ✅"}

# include router
app.include_router(run_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    