""" Backend Service Run """

# FastAPI
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Local Imports
from database.connection import conn
from routes.loader import loader_router
from routes.analytics import analytics_router


app = FastAPI()

# Эмуляция состояния приложения
is_ready = False
is_alive = True

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    conn()

    print("service ready")
    global is_ready
    is_ready = True


app.include_router(loader_router, prefix="/loader")
app.include_router(analytics_router, prefix="/analytics")



@app.get("/")
async def my_first_get_api():
    return {"message":"First FastAPI example"}


@app.get("/healthcheck")
async def healthcheck():
    health = is_alive and is_ready
    if health:
        return {"status": "OK"}
    if is_alive and (is_ready is False):
        raise HTTPException(status_code=503, detail="Service not ready")
    raise HTTPException(status_code=503, detail="Service unhealthy")

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=True)
