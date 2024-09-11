from sqlmodel import Field, SQLModel


class Sale(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    item_id: str
    store_id: str
    date_id: int
    cnt: int


class Store(SQLModel):
    store_id: str


class Item(SQLModel):
    item_id: str
