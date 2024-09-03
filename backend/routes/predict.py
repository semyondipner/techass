from fastapi import APIRouter
from backend.models.prediction import Prediction

predict_router = APIRouter(tags=["Predict"])


@predict_router.get("/predict", response_model=Prediction)
async def predict():
    info = "Наше предсказание"
    return Prediction(prediction=info)
