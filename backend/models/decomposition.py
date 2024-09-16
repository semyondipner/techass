from sqlmodel import Field, SQLModel
from datetime import datetime
from pydantic import BaseModel


class Decomposition(SQLModel, table=True):
    """ Decomposition """
    id: int = Field(default=None, primary_key=True)
    item_id: str
    store_id: str
    date_id: int
    date: datetime
    cnt: int
    year: int
    wm_yr_wk: int
    store_item_id: str
    trend: float
    seasonality: float


class DecompositionItem(BaseModel):
    """ DecompositionItem """
    store_item_id: str
    date: datetime
    cnt: int
    trend: float
    seasonality: float
