from sqlmodel import Field, SQLModel
from datetime import datetime


class Clustering(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    item_id: str
    store_id: str
    date_id: int
    cnt: int
    date: datetime
    year: int
    wm_yr_wk: int
    store_item_id: str
    cluster: int
