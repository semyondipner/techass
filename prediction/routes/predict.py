from typing import List

# FastAPI
from fastapi import APIRouter, Depends

# Data Processing
import numpy as np
import pandas as pd
from datetime import datetime
from datetime import timedelta

# Modelling
import torch
from chronos import ChronosPipeline

# Local Imports
from database.connection import get_session
from services import prediction as PredictionService
from models.prediction import Prediction, PredictionResponce, PredictionRequest, PredictItemId, PredictHistoryItem


predict_router = APIRouter(tags=["Predict"])

pipeline = ChronosPipeline.from_pretrained(
        "amazon/chronos-t5-tiny",
        device_map="cpu",  # на маке mps, но надо будет поменять на "cpu"
        torch_dtype=torch.bfloat16,
    )


@predict_router.post("/predict")
async def predict(request: PredictionRequest, session=Depends(get_session)):
    """ Make predictions and save them into the DataBase """
    train = PredictionService.get_train(request.items_id, session)
    print("train ", train.head())
    df = make_predictions2(28, train, request.prediction_date)
    df.drop(columns=['item_id']) # Ты же не дропаешь здесь ничего без inplace=True - бесполнезное действие
    df['item_id'] = df.store_item_id
    df.drop(columns=['store_item_id'], inplace=True)
    df['prediction_date'] = request.prediction_date
    PredictionService.save_prediction(df)
    return {"message":"Данные посчитаны, можете забирать"}


@predict_router.get("/get_history_item_id", response_model=List[PredictItemId])
async def get_history_item_id(item_id: str, session=Depends(get_session)):
    """ Get Item History """
    result = PredictionService.get_history_item_id(item_id, session)
    return result


@predict_router.get("/get_prediction_item_id", response_model=List[PredictHistoryItem])
async def get_prediction_item_id(item_id: str, session=Depends(get_session)):
    """ Get preditcions for item by item_id from DataBase """
    result = PredictionService.get_prediction_item_id(item_id, session)
    return result


@predict_router.get("/delete_prediction")
async def delete_prediction(session=Depends(get_session)):
    """ Delete Predtictions """
    print("delete_prediction")
    PredictionService.delete_prediction(session)
    return {'message': "Данные предсказаний успешно удалены"}


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


def make_predictions2(
    prediction_length,
    train: pd.DataFrame,
    start_prediction_date: datetime) -> pd.DataFrame:
    """ Создание предсказаний для каждого store_item_id. """

    all_predicts = []

    for store_item_id in train.store_item_id.unique():
        store_item_id_df = train[train.store_item_id == store_item_id].copy()
        store_id = store_item_id_df.store_id.unique()[0]
        item_id = store_item_id_df.item_id.unique()[0]

        full_date_range = pd.date_range(
            store_item_id_df.date.min(), 
            start_prediction_date - timedelta(days=1)
        )
        full_date_range = pd.DataFrame(data=full_date_range, columns=['date'])
        store_item_id_df = store_item_id_df.merge(full_date_range, on='date', how='right')

        context = torch.tensor(store_item_id_df["cnt"].tolist())
        forecast = pipeline.predict(context, prediction_length)
        low, median, high = np.quantile(forecast[0].numpy(), [0.1, 0.5, 0.9], axis=0)

        predict_range = pd.date_range(start_prediction_date,
                                      start_prediction_date + timedelta(days=prediction_length - 1))

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
