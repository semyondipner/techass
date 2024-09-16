""" sales_dates """

# Data Processing
import pandas as pd

# SQL Connections
from sqlmodel import func, delete
from database.connection import engine_url

# Local Imports
from models.sales_dates import SalesDate


def create_sales_dates(file):
    """ Create Sales and Dates """
    with pd.read_csv(file, chunksize=10000) as reader:
        for chunk in reader:
            chunk.to_sql("salesdate", engine_url, if_exists='append', index=False)


def get_max_date(session):
    """ Get Max Date """
    query = session.query(func.max(SalesDate.date))
    result = query.scalar()
    return result


def delete_data(session):
    """ Delete Data """
    session.exec(delete(SalesDate))
    session.commit()
    session.close()
