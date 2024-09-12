from pydantic import BaseModel


class AnalyticsPredictions(BaseModel):
    date_str: str
    date_end: str
    store_ids: str | list[str]
    items_ids: str | list[str]
