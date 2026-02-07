from fastapi import FastAPI,WebSocket
from fastapi.middleware.cors import CORSMiddleware
from src.routes.ai import router as ai_router
from src.routes.routes_interactive import router as interactive_router
from src.execution_engine.ws import interactive_ws

app = FastAPI(title="jarvis_AI Coding Platform Backend")

# CORS middleware - allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend running ✅"}

@app.websocket("/ws/interactive/{run_id}")
async def ws_term(ws: WebSocket, run_id: str):
    await interactive_ws(ws, run_id)

# include router
app.include_router(interactive_router)
app.include_router(ai_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)