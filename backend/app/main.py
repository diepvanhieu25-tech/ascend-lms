from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import poc_onnx

app = FastAPI(title="Adaptive Learning SQL Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(poc_onnx.router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "message": "Ascend LMS - Adaptive Learning SQL Backend",
        "status": "online",
        "version": "0.1.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/api/v1/health",
            "poc_onnx": "/api/v1/poc/onnx",
        },
    }


@app.get("/api/v1/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
