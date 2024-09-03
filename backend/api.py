from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from backend.routes.predict import predict_router

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
    print("service ready")
    global is_ready
    is_ready = True


app.include_router(predict_router, prefix="/prediction")


@app.get("/")
async def my_first_get_api():
    return {"message":"First FastAPI example"}


@app.get("/healthcheck")
async def healthcheck():
    # Здесь можно добавить дополнительные проверки и автоматизации
    health = is_alive and is_ready
    if health:
        return {"status": "OK"}
    if is_alive and (is_ready is False):
        raise HTTPException(status_code=503, detail="Service not ready")
    raise HTTPException(status_code=503, detail="Service unhealthy")

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000,
                reload=True)
