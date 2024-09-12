from sqlmodel import Field, SQLModel


class Price(SQLModel, table=True):
    item_id: str = Field(primary_key=True)
    store_id: str = Field(primary_key=True)
    wm_yr_wk: int = Field(primary_key=True)
    sell_price: float
