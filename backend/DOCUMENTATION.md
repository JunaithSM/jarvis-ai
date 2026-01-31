# Backend Documentation

This document provides detailed documentation for the Jarvis AI Coding Platform backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
5. [Core Modules](#core-modules)
6. [Configuration](#configuration)
7. [Error Handling](#error-handling)
8. [Frontend Integration](#frontend-integration)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

---

## Overview

The backend is built with **FastAPI** and provides a code execution service that supports multiple programming languages. It allows users to submit code, compile it (if necessary), and execute it in an isolated session-based environment.

### Key Features

| Feature | Description |
|---------|-------------|
| 🚀 Multi-language Support | Execute Python, C, C++, and Java code |
| 🔒 Session Isolation | Each user session gets an isolated execution environment |
| ⏱️ Timeout Protection | Configurable compile and runtime timeouts prevent infinite loops |
| 🌐 CORS Enabled | Ready for frontend integration with configurable origins |
| 📊 Execution Metrics | Returns timing information and exit codes |
| 🔄 Hot Reload | Development server supports automatic reload on code changes |

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime environment |
| FastAPI | 0.100+ | Web framework |
| Uvicorn | 0.22+ | ASGI server |
| Pydantic | 2.0+ | Data validation |
| GCC/G++ | System | C/C++ compilation |
| OpenJDK | System | Java compilation and execution |

---

## Getting Started

### Prerequisites

Before running the backend, ensure you have:

1. **Python 3.11+** installed
2. **GCC/G++** for C/C++ compilation
3. **OpenJDK** for Java compilation
4. **uv** (recommended) or **pip** for dependency management

### Installation

#### Using uv (Recommended)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
uv sync

# Run the development server
uv run uvicorn main:app --reload
```

#### Using pip

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirement.txt

# Run the server
uvicorn main:app --reload
```

### Verify Installation

Once running, verify the server is working:

```bash
# Health check
curl http://localhost:8000

# Expected response:
# {"message": "Backend running ✅"}

# Access Swagger UI
open http://localhost:8000/docs
```

---

## Architecture

### Directory Structure

```
backend/
├── main.py                      # Application entry point
├── pyproject.toml               # uv/pip dependencies
├── requirement.txt              # pip dependencies
├── DOCUMENTATION.md             # This file
├── README.md                    # Quick start guide
├── runs/                        # Session execution folders
│   └── {sessionId}/             # Per-session isolated directory
│       ├── main.py              # Python source
│       ├── main.c               # C source
│       ├── main.cpp             # C++ source
│       ├── Main.java            # Java source
│       └── main                 # Compiled binary (C/C++)
└── src/
    ├── __init__.py              # Package initializer
    ├── config/                  # Configuration modules
    │   └── __init__.py
    ├── controllers/             # Business logic (future)
    │   └── __init__.py
    ├── routes/
    │   ├── __init__.py
    │   └── routes_run.py        # Code execution endpoints
    └── services/
        ├── __init__.py
        └── compiler_engine.py   # Compile & run logic
```

### Request Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT REQUEST                                   │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              FASTAPI SERVER                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │  CORS           │    │  Validation     │    │  Route          │          │
│  │  Middleware     │───▶│  (Pydantic)     │───▶│  Handler        │          │
│  └─────────────────┘    └─────────────────┘    └────────┬────────┘          │
└─────────────────────────────────────────────────────────┼────────────────────┘
                                                          │
                                                          ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           COMPILER ENGINE                                     │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Step 1: Create Session Folder                                           │ │
│  │ ─────────────────────────────                                           │ │
│  │ runs/{sessionId}/ ← Created if not exists                               │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                        │
│                                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Step 2: Write Source Code                                               │ │
│  │ ────────────────────────                                                │ │
│  │ Write code to: main.py | main.c | main.cpp | Main.java                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                        │
│                                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Step 3: Compile (if required)                                           │ │
│  │ ─────────────────────────────                                           │ │
│  │ • Python: Skip (interpreted)                                            │ │
│  │ • C: gcc main.c -o main                                                 │ │
│  │ • C++: g++ main.cpp -o main                                             │ │
│  │ • Java: javac Main.java                                                 │ │
│  │                                                                          │ │
│  │ Timeout: 5 seconds                                                       │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                        │
│                                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Step 4: Execute Program                                                 │ │
│  │ ───────────────────────                                                 │ │
│  │ • Python: python3 main.py                                               │ │
│  │ • C/C++: ./main                                                         │ │
│  │ • Java: java Main                                                       │ │
│  │                                                                          │ │
│  │ Timeout: 3 seconds                                                       │ │
│  │ Input: stdin from request                                                │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                        │
│                                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ Step 5: Collect Results                                                 │ │
│  │ ───────────────────────                                                 │ │
│  │ • stdout: Program output                                                │ │
│  │ • stderr: Error messages                                                │ │
│  │ • exit_code: Process return code                                        │ │
│  │ • time_ms: Execution duration                                           │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              JSON RESPONSE                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    main.py      │         │  routes_run.py  │         │compiler_engine  │
│                 │         │                 │         │                 │
│ • FastAPI Init  │────────▶│ • RunRequest    │────────▶│ • File I/O      │
│ • CORS Config   │         │ • Validation    │         │ • Subprocess    │
│ • Router Mount  │         │ • Error Handle  │         │ • Timeout Mgmt  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## API Reference

### Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Production | Configure based on deployment |

### Interactive Documentation

| Type | URL | Description |
|------|-----|-------------|
| Swagger UI | `/docs` | Interactive API testing |
| ReDoc | `/redoc` | Alternative documentation |
| OpenAPI JSON | `/openapi.json` | Raw OpenAPI specification |

---

### `GET /`

Health check endpoint to verify the server is running.

**Request:**
```http
GET / HTTP/1.1
Host: localhost:8000
```

**Response:**
```json
{
  "message": "Backend running ✅"
}
```

**Use Cases:**
- Load balancer health checks
- Monitoring systems
- Development verification

---

### `POST /run/{sessionId}`

Execute code in a specified programming language.

#### Path Parameters

| Parameter   | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| `sessionId` | string | Yes      | Unique identifier for the user's session |

**Session ID Guidelines:**
- Should be unique per user/browser session
- Recommended format: `session_` + random alphanumeric string
- Example: `session_jm9dkn2xqql`
- Can be stored in browser's `sessionStorage` for persistence

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |

#### Request Body

```json
{
  "language": "python",
  "code": "print('Hello, World!')",
  "stdin": ""
}
```

| Field      | Type   | Required | Default | Description                            |
|------------|--------|----------|---------|----------------------------------------|
| `language` | string | Yes      | -       | Programming language identifier        |
| `code`     | string | Yes      | -       | Source code to execute                 |
| `stdin`    | string | No       | `""`    | Standard input for the program         |

#### Supported Languages

| Language | Identifier | Source File | Compiler | Runtime Command |
|----------|------------|-------------|----------|-----------------|
| Python 3 | `python`   | `main.py`   | None     | `python3 main.py` |
| C        | `c`        | `main.c`    | `gcc`    | `./main` |
| C++      | `cpp`      | `main.cpp`  | `g++`    | `./main` |
| Java     | `java`     | `Main.java` | `javac`  | `java Main` |

#### Response Format

```json
{
  "status": "success",
  "stdout": "Hello, World!\n",
  "stderr": "",
  "exit_code": 0,
  "time_ms": 45,
  "sessionId": "session_abc123"
}
```

#### Response Fields

| Field       | Type    | Always Present | Description                               |
|-------------|---------|----------------|-------------------------------------------|
| `status`    | string  | Yes            | Execution status code                     |
| `stdout`    | string  | Yes            | Standard output from the program          |
| `stderr`    | string  | Yes            | Standard error / compilation errors       |
| `exit_code` | integer | No             | Program exit code (only on execution)     |
| `time_ms`   | integer | No             | Execution time in milliseconds            |
| `sessionId` | string  | Yes            | Echo of the session identifier            |

#### Status Codes Reference

| Status            | HTTP | Description                              | Cause |
|-------------------|------|------------------------------------------|-------|
| `success`         | 200  | Code executed successfully               | Program exited with code 0 |
| `error`           | 200  | General error occurred                   | Unsupported language, file write error |
| `compile_error`   | 200  | Compilation failed                       | Syntax errors, missing includes |
| `runtime_error`   | 200  | Program crashed or failed                | Segfault, exceptions, non-zero exit |
| `compile_timeout` | 200  | Compilation exceeded time limit          | Compile took > 5 seconds |
| `runtime_timeout` | 200  | Execution exceeded time limit            | Program ran > 3 seconds |

---

## Core Modules

### `main.py`

Entry point for the FastAPI application.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.routes_run import router as run_router

app = FastAPI(title="jarvis_AI Coding Platform Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
def home():
    return {"message": "Backend running ✅"}

# Mount code execution routes
app.include_router(run_router)
```

**Responsibilities:**
| Task | Description |
|------|-------------|
| App Initialization | Create FastAPI instance with metadata |
| CORS Setup | Allow cross-origin requests from frontend |
| Route Registration | Mount the code execution router |
| Health Check | Provide basic server status endpoint |

---

### `src/routes/routes_run.py`

Defines the `/run/{sessionId}` endpoint.

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.services.compiler_engine import compile_and_run

router = APIRouter()

class RunRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""

@router.post("/run/{sessionId}")
def run_code(sessionId: str, payload: RunRequest):
    if not sessionId:
        raise HTTPException(status_code=400, detail="sessionId missing")
    
    result = compile_and_run(
        session_id=sessionId,
        language=payload.language,
        code=payload.code,
        stdin=payload.stdin or ""
    )
    return result
```

**Components:**

| Component    | Type           | Description                      |
|--------------|----------------|----------------------------------|
| `router`     | `APIRouter`    | FastAPI router instance          |
| `RunRequest` | `BaseModel`    | Pydantic model for validation    |
| `run_code()` | Function       | Route handler for code execution |

---

### `src/services/compiler_engine.py`

Core logic for compiling and executing code.

#### Constants

```python
SUPPORTED_LANGS = {"python", "c", "cpp", "java"}
```

#### Functions

| Function            | Parameters                        | Returns    | Description                               |
|---------------------|-----------------------------------|------------|-------------------------------------------|
| `make_run_folder()` | `session_id`, `base_dir`          | `str`      | Creates isolated directory for session    |
| `get_filename()`    | `language`                        | `str`      | Returns appropriate filename for language |
| `get_commands()`    | `language`, `filename`            | `tuple`    | Returns compile/run commands              |
| `compile_and_run()` | `session_id`, `language`, `code`, etc. | `Dict` | Main execution function                   |

#### `make_run_folder()`

```python
def make_run_folder(session_id: str, base_dir: str = "runs") -> str:
    """
    Creates: runs/{session_id}/
    Returns: Path to the created folder
    """
```

#### `get_filename()`

```python
def get_filename(language: str) -> str:
    """
    Mapping:
    - python → main.py
    - c → main.c
    - cpp → main.cpp
    - java → Main.java (PascalCase for Java convention)
    """
```

#### `get_commands()`

```python
def get_commands(language: str, filename: str):
    """
    Returns: (compile_cmd, run_cmd)
    
    Examples:
    - python: (None, ["python3", "main.py"])
    - c: (["gcc", "main.c", "-o", "main"], ["./main"])
    - cpp: (["g++", "main.cpp", "-o", "main"], ["./main"])
    - java: (["javac", "Main.java"], ["java", "Main"])
    """
```

#### `compile_and_run()`

```python
def compile_and_run(
    session_id: str,
    language: str,
    code: str,
    stdin: str = "",
    base_dir: str = "runs",
    compile_timeout: int = 5,
    run_timeout: int = 3,
) -> Dict:
    """
    Complete execution pipeline:
    1. Validate language
    2. Create session folder
    3. Write code to file
    4. Compile (if required)
    5. Execute program
    6. Return results
    """
```

---

## Configuration

### Environment Variables

Currently, the backend uses hardcoded configuration. Future versions may support:

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed origins | `localhost:3000` |
| `COMPILE_TIMEOUT` | Compile timeout (seconds) | `5` |
| `RUN_TIMEOUT` | Execution timeout (seconds) | `3` |
| `RUNS_DIR` | Session storage directory | `runs/` |

### Timeouts

| Timeout Type | Default | Purpose |
|--------------|---------|---------|
| Compile      | 5 sec   | Prevent slow/infinite compilation |
| Runtime      | 3 sec   | Prevent infinite loops, long-running programs |

### Session Storage

Sessions are stored in the `runs/` directory:

```
runs/
├── session_abc123/
│   ├── main.py          # Python source
│   └── (execution artifacts)
├── session_xyz789/
│   ├── main.cpp         # C++ source
│   └── main             # Compiled binary
└── session_java001/
    ├── Main.java        # Java source
    └── Main.class       # Compiled bytecode
```

**Storage Lifecycle:**
1. Folder created on first execution request
2. Code file written on each execution
3. Compiled artifacts remain until cleanup
4. **Currently: No automatic cleanup** (manual cleanup required)

---

## Error Handling

### HTTP Error Responses

| HTTP Code | Condition             | Response Body |
|-----------|-----------------------|---------------|
| 400       | Missing/empty sessionId | `{"detail": "sessionId missing"}` |
| 422       | Invalid request body  | Pydantic validation error with details |
| 500       | Internal server error | FastAPI default error response |

### Validation Errors (422)

When request body validation fails:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "language"],
      "msg": "Field required",
      "input": {}
    }
  ]
}
```

### Execution Errors

Execution errors return HTTP 200 with error status in body:

**Compile Error Example (C):**
```json
{
  "status": "compile_error",
  "stdout": "",
  "stderr": "main.c:1:1: error: expected '=', ',', ';', 'asm' or '__attribute__' at end of input\n 1 | invalid code\n   | ^~~~~~~",
  "sessionId": "session_123"
}
```

**Runtime Error Example (Python):**
```json
{
  "status": "runtime_error",
  "stdout": "",
  "stderr": "Traceback (most recent call last):\n  File \"main.py\", line 1, in <module>\n    print(1/0)\nZeroDivisionError: division by zero",
  "exit_code": 1,
  "time_ms": 28,
  "sessionId": "session_456"
}
```

**Timeout Example:**
```json
{
  "status": "runtime_timeout",
  "stdout": "",
  "stderr": "Program timed out",
  "sessionId": "session_789"
}
```

---

## Frontend Integration

### Session Management

The frontend should manage session IDs using browser storage:

```javascript
// services/api.js
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('jarvis_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('jarvis_session_id', sessionId);
  }
  return sessionId;
};
```

### Making API Requests

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const runCode = async (sessionId, language, code, stdin = '') => {
  const response = await api.post(`/run/${sessionId}`, {
    language,
    code,
    stdin,
  });
  return response.data;
};
```

### Handling Responses

```javascript
const handleRunCode = async () => {
  try {
    const result = await runCode(sessionId, language, code);
    
    if (result.status === 'success') {
      console.log('Output:', result.stdout);
    } else {
      console.error('Error:', result.stderr);
    }
  } catch (error) {
    if (error.response) {
      // Server error (400, 422, 500)
      console.error('Server error:', error.response.data);
    } else {
      // Network error
      console.error('Network error:', error.message);
    }
  }
};
```

### CORS Configuration

The backend allows requests from these origins:
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:3000` (React dev server alternate)
- `http://localhost:8000` (Backend Swagger UI)

To add more origins, modify `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://your-production-domain.com",  # Add production URL
    ],
    # ...
)
```

---

## Testing

### Manual Testing with cURL

**Python Execution:**
```bash
curl -X POST "http://localhost:8000/run/test_session" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "name = input()\nprint(f\"Hello, {name}!\")",
    "stdin": "World"
  }'
```

**C++ Execution:**
```bash
curl -X POST "http://localhost:8000/run/cpp_session" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "cpp",
    "code": "#include <iostream>\nint main() { std::cout << \"Hello C++\" << std::endl; return 0; }",
    "stdin": ""
  }'
```

**Java Execution:**
```bash
curl -X POST "http://localhost:8000/run/java_session" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "java",
    "code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello Java\"); } }",
    "stdin": ""
  }'
```

**Test Compile Error:**
```bash
curl -X POST "http://localhost:8000/run/error_test" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "c",
    "code": "this is not valid C code",
    "stdin": ""
  }'
```

**Test Timeout:**
```bash
curl -X POST "http://localhost:8000/run/timeout_test" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "while True: pass",
    "stdin": ""
  }'
```

### Using Swagger UI

1. Navigate to `http://localhost:8000/docs`
2. Click on `POST /run/{sessionId}`
3. Click "Try it out"
4. Enter test parameters
5. Click "Execute"

---

## Deployment

### Development

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Considerations

#### 1. Use a Production ASGI Server

```bash
# Using Gunicorn with Uvicorn workers
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### 2. Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Install compilers
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN pip install -r requirement.txt

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 3. Security Hardening

| Measure | Implementation |
|---------|----------------|
| Sandboxing | Run code in isolated containers |
| Resource Limits | Set CPU, memory, disk limits |
| Network Isolation | Disable outbound network for user code |
| Rate Limiting | Implement per-IP rate limits |
| Authentication | Add JWT or API key authentication |

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:** Browser console shows CORS error

**Solution:** Ensure frontend origin is in `allow_origins` list in `main.py`

#### 2. Compiler Not Found

**Symptom:** `compile_error` with "command not found"

**Solution:** Install required compilers:
```bash
# Ubuntu/Debian
sudo apt install gcc g++ default-jdk

# macOS
brew install gcc
brew install --cask temurin
```

#### 3. Permission Denied

**Symptom:** Error writing to `runs/` directory

**Solution:** Check directory permissions:
```bash
chmod 755 runs/
```

#### 4. JSON Parse Error (422)

**Symptom:** `422 Unprocessable Entity` with JSON decode error

**Solution:** Ensure proper JSON encoding, especially for special characters in code:
```javascript
// Use JSON.stringify properly
const payload = JSON.stringify({
  language: "python",
  code: "print('Hello')",  // Ensure proper escaping
  stdin: ""
});
```

#### 5. Timeout Too Short

**Symptom:** Legitimate programs timing out

**Solution:** Increase timeout in `compiler_engine.py`:
```python
def compile_and_run(
    # ...
    compile_timeout: int = 10,  # Increase from 5
    run_timeout: int = 10,      # Increase from 3
)
```

---

## Future Enhancements

### Planned Features

| Feature | Priority | Description |
|---------|----------|-------------|
| JavaScript Support | High | Add Node.js execution |
| Session Cleanup | High | Automatic cleanup of old sessions |
| Rate Limiting | High | Prevent API abuse |
| WebSocket Output | Medium | Real-time output streaming |
| Code Caching | Medium | Cache compiled binaries |
| Multi-file Support | Low | Allow multiple source files |
| Custom Compiler Flags | Low | User-specified compile options |

### Adding New Language Support

To add a new language (e.g., JavaScript):

1. **Update `SUPPORTED_LANGS`:**
```python
SUPPORTED_LANGS = {"python", "c", "cpp", "java", "javascript"}
```

2. **Update `get_filename()`:**
```python
elif language == "javascript":
    filename = "main.js"
```

3. **Update `get_commands()`:**
```python
elif language == "javascript":
    run_cmd = ["node", filename]
```

---

## License

MIT License

---

*Last Updated: January 31, 2026*
