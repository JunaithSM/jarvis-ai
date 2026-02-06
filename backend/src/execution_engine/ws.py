import asyncio
from fastapi import WebSocket
from src.execution_engine.store import RUNNING, LOCK


async def interactive_ws(ws: WebSocket, run_id: str):

    await ws.accept()

    async with LOCK:
        proc = RUNNING.get(run_id)

    if not proc:
        await ws.send_text("Invalid runId")
        return

    async def send_output():
        while True:
            line = await proc.stdout.readline()
            if not line:
                break
            await ws.send_text(line.decode())

    sender = asyncio.create_task(send_output())

    try:
        while True:
            data = await ws.receive_text()
            proc.stdin.write((data + "\n").encode())
            await proc.stdin.drain()

    except:
        pass

    sender.cancel()
