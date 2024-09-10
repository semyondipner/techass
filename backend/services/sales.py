from backend.models.sales import Sale
import pandas as pd
from backend.database.connection import engine_url


def create_sales(file):
    with pd.read_csv(file, chunksize=10000) as reader:
        for chunk in reader:
            chunk.to_sql("sale", engine_url, if_exists='append', index=False)
