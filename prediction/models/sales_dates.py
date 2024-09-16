""" sales_dates.py """
from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class SalesDate(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    date: datetime
    wm_yr_wk: int
    weekday: str
    wday: int
    month: int
    year: int
    event_name_1: Optional[str]
    event_type_1: Optional[str]
    event_name_2: Optional[str]
    event_type_2: Optional[str]
    date_id: int
    CASHBACK_STORE_1: int
    CASHBACK_STORE_2: int
    CASHBACK_STORE_3: int
