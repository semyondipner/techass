from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from models.prediction import Prediction, PredictionResponce
from database.connection import get_session
from services import prices as PricesService
from services import sales_dates as SalesDatesService
from services import sales as SalesService
from services import prediction as PredictionService
from zipfile import ZipFile
from datetime import timedelta
import tempfile
import sqlalchemy
import pandas as pd
import torch
import numpy as np
from chronos import ChronosPipeline
import os
from database.connection import engine_url

predict_router = APIRouter(tags=["Predict"])

DATA_PATH = "zip_data"

# os.environ["CURL_CA_BUNDLE"] = "/Users/a.s.senina/PycharmProjects/techass/cisco.crt"

#pipeline = ChronosPipeline.from_pretrained(
 #       "amazon/chronos-t5-tiny",
  #      device_map="cpu",  # на маке mps, но надо будет поменять на "cpu"
   #     torch_dtype=torch.bfloat16,
   # )


@predict_router.get("/predict", response_model=PredictionResponce)
async def predict(session=Depends(get_session)):
    df = PredictionService.get_dataframe(session)

    return df


@predict_router.post("/upload_data", response_model=PredictionResponce)
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

    df = make_predictions(28, train)
    print("df", df.head())

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


def make_predictions(prediction_length, train: pd.DataFrame) -> pd.DataFrame:
    """Создание предсказаний для каждого store_item_id."""

    all_predicts = []

    train.date = pd.to_datetime(train.date)
    start_date = train['date'].max() + timedelta(days=1)
    end_date = start_date + timedelta(days=prediction_length - 1)
    predict_range = pd.date_range(start_date, end_date)

    for store_item_id in train.store_item_id.unique():
        store_item_id_df = train[train.store_item_id == store_item_id].copy()

        store_id = store_item_id_df.store_id.unique()[0]
        item_id = store_item_id_df.item_id.unique()[0]
        context = torch.tensor(store_item_id_df["cnt"].tolist())
        forecast = pipeline.predict(context, prediction_length)
        low, median, high = np.quantile(forecast[0].numpy(), [0.1, 0.5, 0.9], axis=0)

        # Формирование DataFrame с результатами
        data = {
            'date': predict_range.tolist(),
            'low': low.tolist(),
            'median': median.tolist(),
            'high': high.tolist()
        }
        result = pd.DataFrame.from_dict(data)
        result['store_item_id'] = store_item_id
        result['store_id'] = store_id
        result['item_id'] = item_id

        all_predicts.append(result)

    return pd.concat(all_predicts)
