import pandas as pd
import numpy as np
import torch
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from chronos import ChronosPipeline

class ClusterModel:
    def __init__(self, data_path: str, n_clusters: int = 7, pca_components: int = 2):

        self.data_path = data_path
        self.n_clusters = n_clusters
        self.pca_components = pca_components
        self.pipeline = ChronosPipeline.from_pretrained(
            "amazon/chronos-t5-tiny",
            device_map="mps", # на маке mps, но надо будет поменять на "cpu"
            torch_dtype=torch.bfloat16,
        )
        self.train = None

    def get_historical_data(self) -> pd.DataFrame:

        ### Поменять путь
        train = pd.read_csv(f"{self.data_path}/shop_sales.csv")
        dates_df = pd.read_csv(f"{self.data_path}/shop_sales_dates.csv")
        
        # Объединение и предобработка данных 
        train = train.merge(dates_df[['date', 'date_id', 'year', 'wm_yr_wk']], on='date_id')
        train['store_item_id'] = train.item_id
        train.item_id = train.item_id.apply(lambda x: x.split('_')[-1])
        
        self.train = train
        return train

    def select_item_store_ids(self) -> np.ndarray:
        
        select = self.train.groupby(["store_item_id", "item_id"], as_index=False).cnt.sum()
        select['max_value'] = select.groupby("item_id")['cnt'].transform('max')
        select = select[select.cnt == select.max_value].store_item_id.unique()
        
        return select

    def get_embeddings(self, store_item_id: str) -> np.ndarray:

        store_item_df = self.train[self.train.store_item_id == store_item_id].copy()
        context = torch.tensor(store_item_df["cnt"].tolist())
        embeddings, _ = self.pipeline.embed(context)
        return embeddings[0].mean(axis=0).float().numpy().tolist()

    def get_clusters(self) -> pd.DataFrame:
        
        select_ids = self.select_item_store_ids()
    
        item_embeddings = []
        item_ids = []

        for store_item_id in select_ids:
            item_id = self.train[self.train.store_item_id == store_item_id].item_id.unique()[0]
            embedding = self.get_embeddings(store_item_id)
    
            item_ids.append(item_id)
            item_embeddings.append(embedding)
            
        data = np.array(item_embeddings)
        pca = PCA(n_components=self.pca_components)
        data_reduced = pca.fit_transform(item_embeddings)
        
        kmeans = KMeans(n_clusters=self.n_clusters, random_state=9)
        clusters = kmeans.fit_predict(data_reduced)

        df_clusters = pd.DataFrame({
            'item_id': item_ids,
            'cluster': clusters
        })
        
        self.train = self.train.merge(df_clusters, on='item_id')
        return self.train

    def run(self) -> pd.DataFrame:

        self.get_historical_data()
        return self.get_clusters()


if __name__ == "__main__":
    
    ## поменять путь
    
    data_path = "data"  
    cluster_model = ClusterModel(data_path=data_path, n_clusters=7, pca_components=2)
    result = cluster_model.run()