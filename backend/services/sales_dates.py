from models.sales_dates import SalesDate
import pandas as pd
from database.connection import engine_url
from sqlmodel import func


def create_sales_dates(file):
    with pd.read_csv(file, chunksize=10000) as reader:
        for chunk in reader:
            chunk.to_sql("salesdate", engine_url, if_exists='append', index=False)


def get_max_date(session):
    query = session.query(func.max(SalesDate.date))
    result = query.scalar()

    return result
