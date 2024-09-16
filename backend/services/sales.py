""" sales.py """
from typing import List

# Data Processing
import pandas as pd

# SQL Connections
from sqlmodel import delete
from database.connection import engine_url

# Local Imports
from models.sales_dates import SalesDate
from models.sales import Sale, Store, Item


def create_sales(file):
    with pd.read_csv(file, chunksize=10000) as reader:
        for chunk in reader:
            chunk.to_sql("sale", engine_url, if_exists='append', index=False)


def get_stores(session) -> List[Store]:
    results_db = session.query(Sale.store_id).group_by(Sale.store_id)
    results = []
    for sale in results_db:
        results.append(Store(store_id=sale.store_id))
    print("get_stores")
    print(results)
    return results


def get_items(session) -> List[Item]:
    results_db = session.query(Sale.item_id).group_by(Sale.item_id)
    results = []
    for sale in results_db:
        results.append(Item(item_id=sale.item_id))
    print("get_items")
    print(results)
    return results


def get_dataframe(unique_item_ids, session):
    query = session.query(Sale.item_id, Sale.store_id, Sale.date_id, Sale.cnt, SalesDate.date, SalesDate.year,
                          SalesDate.wm_yr_wk
                          ).join(SalesDate, Sale.date_id == SalesDate.date_id).filter(Sale.item_id.in_(unique_item_ids))

    # Выполнение запроса и получение результатов
    results = query.all()
    dict_list = [result._asdict() for result in results]

    # Преобразование списка словарей в DataFrame
    df = pd.DataFrame(dict_list)

    df['store_item_id'] = df.item_id
    df.item_id = df.item_id.apply(lambda x: x.split('_')[-1])

    return df


def delete_data(session):
    session.exec(delete(Sale))
    session.commit()
    session.close()
