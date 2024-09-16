""" Prices """

# Data Processing
import pandas as pd

# SQL Connections
import psycopg2
import sqlalchemy
from sqlmodel import delete
from database.connection import engine_url

# Local Imports
from models.price import Price


def create_price(price: Price, session):
    """ create_price """
    session.add(price)
    session.commit()
    session.refresh(price)


def create_prices(file):
    """ create_prices """
    with pd.read_csv(file, chunksize=10000) as reader:
        for chunk in reader:
                chunk.to_sql("price", engine_url, if_exists='append', index=False)


def delete_data(session):
    """ delete_data """
    session.exec(delete(Price))
    session.commit()
    session.close()
