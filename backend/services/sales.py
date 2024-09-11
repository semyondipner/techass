from models.sales import Sale, Store, Item
import pandas as pd
from database.connection import engine_url
from typing import List


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
