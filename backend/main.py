from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src.routes.routes_run import router as run_router
from backend.src.routes.ai import router as ai_router

app = FastAPI(title="jarvis_AI Coding Platform Backend")

# CORS middleware - allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend running ✅"}

# include router
app.include_router(run_router)
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)