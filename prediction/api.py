""" Prediction Service Run """

# FastAPI
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Local Imports
from database.connection import conn
from routes.predict import predict_router


predict = FastAPI()

# Эмуляция состояния приложения
is_ready = False
is_alive = True

origins = ["*"]
predict.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@predict.on_event("startup")
def on_startup():
    conn()

    print("prediction service ready")
    global is_ready
    is_ready = True


predict.include_router(predict_router, prefix="/prediction")


@predict.get("/")
async def my_first_get_api():
    return {"message": "Prediction Service"}


@predict.get("/healthcheck")
async def healthcheck():
    """ healthcheck """
    health = is_alive and is_ready
    if health:
        return {"status": "OK"}
    if is_alive and (is_ready is False):
        raise HTTPException(status_code=503, detail="Service not ready")
    raise HTTPException(status_code=503, detail="Service unhealthy")

if __name__ == "__main__":
    uvicorn.run("api:predict", host="0.0.0.0", port=9080, reload=True)
