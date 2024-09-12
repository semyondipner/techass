from sqlmodel import Field, SQLModel


class Sale(SQLModel, table=True):
    item_id: str = Field(primary_key=True)
    store_id: str = Field(primary_key=True)
    date_id: int = Field(primary_key=True)
    cnt: int


class Store(SQLModel):
    store_id: str


class Item(SQLModel):
    item_id: str
