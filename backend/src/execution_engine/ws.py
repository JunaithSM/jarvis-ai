import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from src.execution_engine.store import RUNNING, LOCK


async def interactive_ws(ws: WebSocket, run_id: str):
    print("incoming run_id", run_id)
    print("Active store:", list(RUNNING.keys()))

    await ws.accept()

    async with LOCK:
        print("current running keys", list(RUNNING.keys()))
        proc = RUNNING.get(run_id)

    if not proc:
        await ws.send_text("__EXIT__:1")
        await ws.close()
        return
    print("PROCESS FOUND - ATTACHING SOCKET")

    finished = False

    async def send_output():
        """Stream stdout chunks to the WebSocket client, then send exit sentinel."""
        nonlocal finished
        try:
            while True:
                chunk = await proc.stdout.read(4096)
                if not chunk:
                    break
                await ws.send_text(chunk.decode())

            # Process has finished writing — wait for it to fully exit
            await proc.wait()
            await ws.send_text(f"__EXIT__:{proc.returncode}")
            finished = True
        except Exception as e:
            print("send_output error:", e)

    sender = asyncio.create_task(send_output())

    try:
        while True:
            data = await ws.receive_text()
            if proc.returncode is not None:
                break  # process already exited
            proc.stdin.write((data + "\n").encode())
            await proc.stdin.drain()

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print("SOCKET CLOSED / INPUT LOOP ENDED", e)
    finally:
        print("WS HANDLER EXITING...")

        # If the process is still alive, kill it
        if proc.returncode is None:
            try:
                proc.kill()
            except ProcessLookupError:
                pass

        # Wait for the sender to finish so all output is flushed
        if not finished:
            try:
                await asyncio.wait_for(sender, timeout=3.0)
            except (asyncio.TimeoutError, Exception):
                sender.cancel()
        else:
            sender.cancel()

        # Cleanup the store
        async with LOCK:
            RUNNING.pop(run_id, None)

        try:
            await ws.close()
        except Exception:
            pass
