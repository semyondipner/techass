from sqlmodel import Field, SQLModel


class Price(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    item_id: str
    store_id: str
    wm_yr_wk: int
    sell_price: float
