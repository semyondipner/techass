from pydantic import BaseModel
from datetime import datetime
from typing import List

from sqlmodel import Field, SQLModel


class Prediction(SQLModel, table=True):
    """ Prediction SQLModel """
    item_id: str = Field(primary_key=True)
    store_id: str = Field(primary_key=True)
    date: datetime = Field(primary_key=True)
    low: float
    median: float
    high: float
    prediction_date: datetime


class DayPrediction(BaseModel):
    """ DayPrediction BaseModel """
    date: datetime
    low: float
    median: float
    high: float


class PredictionItem(BaseModel):
    """ PredictionItem BaseModel """
    item_id: str
    store_id: str
    prediction_date: datetime
    day_prediction: List[DayPrediction]


class PredictionResponce(BaseModel):
    """ PredictionResponce BaseModel """
    predictions: List[PredictionItem]


class PredictionRequest(BaseModel):
    """ PredictionRequest BaseModel """
    prediction_date: datetime
    items_id: List[str]


class PredictItemId(BaseModel):
    """ PredictItemId BaseModel """
    date: datetime
    cnt: int
    item_id: str


class PredictHistoryItem(BaseModel):
    """ PredictHistoryItem BaseModel """
    date: datetime
    low: float
    median: float
    high: float
    item_id: str
