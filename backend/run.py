#!/usr/bin/env python3

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="192.168.1.92",
        port=8000,
        reload=True,
        log_level="info"
    )