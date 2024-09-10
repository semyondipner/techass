from backend.models.sales_dates import SalesDate
import pandas as pd
from backend.database.connection import engine_url


def create_sales_dates(file):
    with pd.read_csv(file, chunksize=10000) as reader:
        for chunk in reader:
            chunk.to_sql("salesdate", engine_url, if_exists='append', index=False)
