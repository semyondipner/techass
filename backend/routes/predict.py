from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from backend.models.prediction import Prediction
from backend.database.connection import get_session
import pandas as pd
from backend.services import prices as PricesService
from backend.services import sales_dates as SalesDatesService
from backend.services import sales as SalesService
from backend.models.price import Price
from zipfile import ZipFile

predict_router = APIRouter(tags=["Predict"])

DATA_PATH = "zip_data"


@predict_router.get("/predict", response_model=Prediction)
async def predict():
    info = "Наше предсказание"
    return Prediction(prediction=info)


@predict_router.post("/upload_data", response_model=Prediction)
async def upload_data(file: UploadFile = File(...), session=Depends(get_session)):       # noqa: B008
    print("upload_data ", file)

    if file.filename.endswith('.zip') == False:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Переданный файл должен быть .zip архивом")

    with ZipFile(file.file, 'r') as zip_ref:
       zip_ref.extractall(DATA_PATH)

    PricesService.create_prices(DATA_PATH+"/shop_sales_prices.csv")
    SalesService.create_sales(DATA_PATH+"/shop_sales.csv")
    SalesDatesService.create_sales_dates(DATA_PATH + "/shop_sales_dates.csv")

    return Prediction(prediction="Файл обработан")
