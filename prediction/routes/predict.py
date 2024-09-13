from fastapi import APIRouter, Depends
from models.prediction import Prediction, PredictionResponce, PredictionRequest
from database.connection import get_session
from services import prediction as PredictionService
from datetime import timedelta
import pandas as pd
import torch
import numpy as np
from chronos import ChronosPipeline

predict_router = APIRouter(tags=["Predict"])

pipeline = ChronosPipeline.from_pretrained(
        "amazon/chronos-t5-tiny",
        device_map="cpu",  # на маке mps, но надо будет поменять на "cpu"
        torch_dtype=torch.bfloat16,
    )


@predict_router.post("/predict", response_model=PredictionResponce)
async def predict(request: PredictionRequest, session=Depends(get_session)):
    train = PredictionService.get_train(request.items_id, session)

    print("train ", train.head())
    df = make_predictions(28, train)
    #pd.read_csv("/Users/a.s.senina/PycharmProjects/techass/prediction/routes/predictions.csv")
    df.drop(columns=['item_id'])
    df['item_id'] = df.store_item_id
    df.drop(columns=['store_item_id'], inplace=True)
    df['prediction_date'] = request.prediction_date
    PredictionService.save_prediction(df)

    prediction = PredictionService.get_dataframe(session)
    return prediction


@predict_router.get("/delete_prediction")
async def delete_prediction(session=Depends(get_session)):
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
