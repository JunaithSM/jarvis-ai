import asyncio

# runId -> process
RUNNING = {}

# prevent race conditions
LOCK = asyncio.Lock()
