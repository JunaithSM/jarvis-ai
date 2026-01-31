# Connecting Frontend to Backend

## Prerequisites

Install the Socket.IO client in your frontend project:

```bash
cd /home/junaith/Programs/Jarvis/frontend
npm install socket.io-client
```

## 1. Connecting to the REST API

You can use `fetch` or `axios` to make HTTP requests to your FastAPI backend.

**Example Component:**

```javascript
import React, { useEffect, useState } from "react";

function ApiTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API Error:", err));
  }, []);

  return (
    <div>
      <h2>API Response:</h2>
      <p>{message}</p>
    </div>
  );
}

export default ApiTest;
```

## 2. Connecting to Socket.IO

Use the `socket.io-client` library to connect to the WebSocket server.

**Example Component:**

```javascript
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Initialize socket outside component to prevent multiple connections
const socket = io("http://localhost:8000", {
  transports: ["websocket", "polling"],
});

function SocketTest() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessage(value) {
      setLastMessage(value);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, []);

  const sendMessage = () => {
    socket.emit("message", "Hello from React!");
  };

  return (
    <div>
      <h2>Socket Status: {isConnected ? "Connected" : "Disconnected"}</h2>
      <p>Last Message: {JSON.stringify(lastMessage)}</p>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
}

export default SocketTest;
```

## CORS Configuration

If you encounter CORS errors, ensure your `main.py` has allowed origins configured correctly. Currently, it is set to allow all (`*`) in the Socket.IO server:

```python
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
```

For FastAPI HTTP endpoints, you might need to add `CORSMiddleware`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
