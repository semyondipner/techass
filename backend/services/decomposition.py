""" Spectral Analysis (Decomposition) """
from models.decomposition import Decomposition, DecompositionItem


def get_dataframe(store_item_id, session):
    query = (
        session
        .query(
            Decomposition.store_item_id, Decomposition.date, 
            Decomposition.cnt, Decomposition.trend, Decomposition.seasonality
        )
        .where(Decomposition.store_item_id==store_item_id)
    )

    results = query.all()

    items = []
    for result in results:
        item = DecompositionItem(
            store_item_id=result.store_item_id,
            date=result.date,
            cnt=result.cnt,
            trend=result.trend,
            seasonality=result.seasonality
        )
        items.append(item)
    return items
