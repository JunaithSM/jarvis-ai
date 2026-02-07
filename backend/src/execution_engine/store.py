import asyncio
from typing import Dict

# runId -> asyncio.subprocess.Process
# Using type hints helps prevent bugs in ws.py and routes_interactive.py
RUNNING: Dict[str, asyncio.subprocess.Process] = {}

# prevent race conditions when accessing the dictionary
LOCK = asyncio.Lock()