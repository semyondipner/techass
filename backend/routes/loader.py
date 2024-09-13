from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from models.prediction import Prediction, PredictionResponce
from database.connection import get_session
from services import prices as PricesService
from services import sales_dates as SalesDatesService
from services import sales as SalesService
from zipfile import ZipFile
from datetime import timedelta
import tempfile
import sqlalchemy
import pandas as pd
import torch
import numpy as np
import os
from database.connection import engine_url

loader_router = APIRouter(tags=["DataLoader"])

DATA_PATH = "zip_data"


@loader_router.post("/upload_data", response_model=PredictionResponce)
async def upload_data(file: UploadFile = File(...), session=Depends(get_session)):       # noqa: B008
    print("upload_data ", file)

    max_date = SalesDatesService.get_max_date(session)
    print("max_date", max_date)

    if file.filename.endswith('.zip') == False:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Переданный файл должен быть .zip архивом")

    with tempfile.NamedTemporaryFile(suffix=".zip") as temp_zip:
        temp_zip.write(await file.read())
        temp_zip.flush()

        with ZipFile(temp_zip.name, 'r') as zip_ref:
            zip_ref.extractall(DATA_PATH)

    #load_file(PricesService.create_prices, DATA_PATH+"/shop_sales_prices.csv")
    #load_file(SalesService.create_sales, DATA_PATH+"/shop_sales.csv")
    #load_file(SalesDatesService.create_sales_dates, DATA_PATH + "/shop_sales_dates.csv")

    df = pd.read_csv(DATA_PATH + "/shop_sales_prices.csv")
    unique_item_ids = df['item_id'].drop_duplicates().tolist()

    unique_item_ids = [
    'STORE_2_085',
    'STORE_2_043',
    'STORE_2_054',
    'STORE_2_325',
    'STORE_2_090',
    'Имитация айди без истории'
    ]
    train = SalesService.get_dataframe(unique_item_ids, session)
    print("train", train.head())

    print(unique_item_ids)

    # ToDo добавить обращение к другом сервису

    # responce =

    return PredictionResponce(predictions=[])


def load_file(func, file_path):
    try:
        func(file_path)
    except sqlalchemy.exc.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="В файле "+file_path+" содержится информация, которая уже загружалась ранее")
    except sqlalchemy.exc.ProgrammingError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="В файле "+file_path+" неправильный формат колонок")
