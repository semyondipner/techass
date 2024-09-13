from models.clustering import Clustering, ClusteringItem
from sqlalchemy import func, distinct


def get_dataframe(cluster, store_id, session):
    query = (
        session.query(Clustering.store_id, Clustering.date, func.sum(Clustering.cnt).label('cnt'))
        .filter(Clustering.cluster == cluster, Clustering.store_id == store_id)
        .group_by(Clustering.store_id, Clustering.date)
    )

    results = query.all()

    session.close()

    items = []
    for result in results:
        item = ClusteringItem(
            store_id=result.store_id,
            date=result.date,
            cnt=result.cnt
        )
        items.append(item)
    return items


def get_clusters(session):

    query = session.query(distinct(Clustering.cluster))

    results = query.all()
    unique_clusters = [result[0] for result in results]

    session.close()
    return unique_clusters


def get_clusters_items(cluster, store_id, session):
    query = session.query(distinct(Clustering.item_id)).filter(Clustering.cluster == cluster, Clustering.store_id == store_id)

    results = query.all()
    unique_clusters = [result[0] for result in results]

    session.close()
    return unique_clusters

