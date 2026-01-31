# Backend Setup

This backend is built using **FastAPI**, **Uvicorn**, and **Socket.IO**.

## Quick Start (Standard Python)

1.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    ```

2.  **Activate the virtual environment**:
    - **Linux/macOS**:
        ```bash
        source venv/bin/activate
        ```
    - **Windows**:
        ```bash
        venv\Scripts\activate
        ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirement.txt
    ```

4.  **Run the server**:
    ```bash
    python main.py
    ```
    *This works because `main.py` includes a startup script.*

    **OR** run with `uvicorn` directly:
    ```bash
    uvicorn main:socket_app --reload
    ```

The server will be available at: http://localhost:8000

---

## Alternative (Using uv)

If you have `uv` installed:

```bash
uv sync
uv run uvicorn main:socket_app --reload
```
