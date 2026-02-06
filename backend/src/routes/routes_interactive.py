import os
import uuid
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel

from backend.src.execution_engine.store import RUNNING, LOCK

router = APIRouter(prefix="/interactive", tags=["Interactive Python"])


class StartReq(BaseModel):
    code: str


@router.post("/start/{sessionId}")
async def start_interactive(sessionId: str, payload: StartReq):

    folder = os.path.join("runs", sessionId)
    os.makedirs(folder, exist_ok=True)

    # overwrite same file
    path = os.path.join(folder, "main.py")
    with open(path, "w", encoding="utf-8") as f:
        f.write(payload.code)

    run_id = str(uuid.uuid4())[:8]

    proc = await asyncio.create_subprocess_exec(
        "python3", "main.py",
        cwd=folder,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )

    async with LOCK:
        RUNNING[run_id] = proc

    asyncio.create_task(timeout_kill(run_id, 30))

    return {"runId": run_id}


@router.post("/stop/{run_id}")
async def stop(run_id: str):

    async with LOCK:
        proc = RUNNING.get(run_id)
        if proc:
            proc.kill()
            del RUNNING[run_id]

    return {"status": "terminated"}


async def timeout_kill(run_id, sec):
    await asyncio.sleep(sec)
    async with LOCK:
        proc = RUNNING.get(run_id)
        if proc:
            proc.kill()
            del RUNNING[run_id]
