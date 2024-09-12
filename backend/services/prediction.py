from models.prediction import Prediction, PredictionItem, PredictionResponce, DayPrediction
from typing import List
from sqlmodel import select

from typing import Callable
from sqlmodel import SQLModel


def create_day_prediction(row: SQLModel, low: float, median: float, high: float) -> DayPrediction:
    return DayPrediction(
        date=row.date,
        low=low,
        median=median,
        high=high
    )


def get_dataframe(session):
    query = select(Prediction)
    results = session.exec(query)

    # Создаем пустой список для объектов PredictionItem
    predictions: List[PredictionItem] = []

    for row in results:
        # Создаем список day_prediction при помощи функции create_day_prediction
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