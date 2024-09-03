from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from backend.routes.predict import predict_router

app = FastAPI()

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


app.include_router(predict_router, prefix="/prediction")

@app.get("/")
async def my_first_get_api():
    return {"message":"First FastAPI example"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000,
                reload=True)
