from models.price import Price
from sqlmodel import select
import pandas as pd
from database.connection import engine_url
import psycopg2
import sqlalchemy


def create_price(price: Price, session):
    session.add(price)
    session.commit()
    session.refresh(price)


def create_prices(file):
    with pd.read_csv(file, chunksize=10000) as reader:
        for chunk in reader:
                chunk.to_sql("price", engine_url, if_exists='append', index=False)
