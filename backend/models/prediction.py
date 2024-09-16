""" Prediction """
from typing import List
from pydantic import BaseModel
from datetime import datetime
from sqlmodel import Field, SQLModel


class Prediction(SQLModel, table=True):
    """ Prediction """
    item_id: str = Field(primary_key=True)
    store_id: str = Field(primary_key=True)
    date: datetime = Field(primary_key=True)
    low: float
    median: float
    high: float
    prediction_date: datetime


class DayPrediction(BaseModel):
    """ DayPrediction """
    date: datetime
    low: float
    median: float
    high: float


class PredictionItem(BaseModel):
    """ PredictionItem """
    item_id: str
    store_id: str
    prediction_date: datetime
    day_prediction: List[DayPrediction]


class PredictionResponce(BaseModel):
    """ PredictionResponce """
    predictions: List[PredictionItem]
