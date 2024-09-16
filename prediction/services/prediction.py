""" Prediction Service """
from typing import List, Callable

# Data Processing
import pandas as pd

# SQLModels
from database.connection import engine_url
from sqlmodel import SQLModel, select, delete

# Local Imports
from models.sales import Sale
from models.sales_dates import SalesDate
from models.prediction import Prediction, PredictionItem, PredictionResponce, DayPrediction, PredictItemId, PredictHistoryItem


def create_day_prediction(row: SQLModel, low: float, median: float, high: float) -> DayPrediction:
    return DayPrediction(
        date=row.date,
        low=low,
        median=median,
        high=high
    )


def save_prediction(df: pd.DataFrame):
    df.to_sql("prediction", engine_url, if_exists='append', index=False)


def delete_prediction(session):
    session.exec(delete(Prediction))
    session.commit()
    session.close()


def get_train(unique_item_ids, session):
    query = (
        session
        .query(
            Sale.item_id, Sale.store_id, Sale.date_id,
            Sale.cnt, SalesDate.date, SalesDate.year,
            SalesDate.wm_yr_wk
        )
        .join(SalesDate, Sale.date_id == SalesDate.date_id)
        .filter(Sale.item_id.in_(unique_item_ids))
    )
    # Выполнение запроса и получение результатов
    results = query.all()
    dict_list = [result._asdict() for result in results]
    # Преобразование списка словарей в DataFrame
    df = pd.DataFrame(dict_list)
    df['store_item_id'] = df.item_id
    df.item_id = df.item_id.apply(lambda x: x.split('_')[-1])
    return df


def get_dataframe(session):
    query = select(Prediction)
    results = session.exec(query)
    predictions: List[PredictionItem] = []
    for row in results:
        day_prediction = [
            create_day_prediction(row, row.low, row.median, row.high)
        ]
        # Создаем объект PredictionItem и добавляем его в список predictions
        prediction_item = PredictionItem(
            item_id=row.item_id,
            store_id=row.store_id,
            prediction_date=row.prediction_date,
            day_prediction=day_prediction
        )
        predictions.append(prediction_item)
    # Создаем объект PredictionResponce
    response = PredictionResponce(predictions=predictions)
    return response


def get_history_item_id(item_id, session):
    query = (
        session
        .query(SalesDate.date, Sale.cnt, Sale.item_id)
        .join(SalesDate, Sale.date_id == SalesDate.date_id)
        .filter(Sale.item_id == item_id)
    )
    results = query.all()
    items = []
    for row in results:
        predict_item = PredictItemId(date=row.date, cnt=row.cnt, item_id=row.item_id)
        items.append(predict_item)
    session.close()
    return items


def get_prediction_item_id(item_id, session):
    query = (
        session
        .query(
            Prediction.date, Prediction.low, Prediction.median,
            Prediction.high, Prediction.item_id
        )
        .filter(Prediction.item_id == item_id)
    )
    results = query.all()
    items = []
    for row in results:
        predict_item = PredictHistoryItem(
            date=row.date, low=row.low, median=row.median,
            high=row.high, item_id=row.item_id
        )
        items.append(predict_item)
    session.close()
    return items
