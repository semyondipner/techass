# Для системы

import json
import pandas as pd
import numpy as np
import torch
from datetime import timedelta
from tqdm.notebook import tqdm
from chronos import ChronosPipeline

class SalesPredictor:
    def __init__(self, data_path: str, prediction_length: int, store_item_ids: list):
        self.store_item_ids = store_item_ids
        self.data_path = data_path
        self.prediction_length = prediction_length
        self.pipeline = ChronosPipeline.from_pretrained(
            "amazon/chronos-t5-tiny",
            device_map="mps", # на маке mps, но надо будет поменять на "cpu"
            torch_dtype=torch.bfloat16,
        )

    def get_historical_data(self) -> pd.DataFrame:
        """Загрузка и предварительная обработка исторических данных."""
        
        #### TO DO - заменить подрузгу данных
        
        train = pd.read_csv(f"{self.data_path}/shop_sales.csv")
        dates_df = pd.read_csv(f"{self.data_path}/shop_sales_dates.csv")
        
        # Объединение и предобработка данных 
        train = train.merge(dates_df[['date', 'date_id', 'year', 'wm_yr_wk']], on='date_id')
        train['store_item_id'] = train.item_id
        train.item_id = train.item_id.apply(lambda x: x.split('_')[-1])
        
        # Фильтрация данных
        train = train[train.store_item_id.isin(self.store_item_ids)]
        
        return train


    def make_predictions(self, train: pd.DataFrame) -> pd.DataFrame:
        """Создание предсказаний для каждого store_item_id."""
        
        all_predicts = []
        
        train.date = pd.to_datetime(train.date)
        start_date = train['date'].max() + timedelta(days=1)
        end_date = start_date + timedelta(days=self.prediction_length - 1)
        predict_range = pd.date_range(start_date, end_date)
        
        for store_item_id in train.store_item_id.unique():
            store_item_id_df = train[train.store_item_id == store_item_id].copy()
            
            store_id = store_item_id_df.store_id.unique()[0]
            item_id = store_item_id_df.item_id.unique()[0]
            context = torch.tensor(store_item_id_df["cnt"].tolist())
            forecast = self.pipeline.predict(context, self.prediction_length)
            low, median, high = np.quantile(forecast[0].numpy(), [0.1, 0.5, 0.9], axis=0)

            # Формирование DataFrame с результатами
            data = {
                'date': predict_range.tolist(),
                'low': low.tolist(),
                'median': median.tolist(),
                'high': high.tolist()
            }
            result = pd.DataFrame.from_dict(data)
            result['store_item_id'] = store_item_id
            result['store_id'] = store_id
            result['item_id'] = item_id
            
            all_predicts.append(result)

        return pd.concat(all_predicts)

    def run(self):
        """Основной метод для запуска предсказаний."""
        
        train = self.get_historical_data()
        result = self.make_predictions(train=train)
        
        return result

# Пример использования
if __name__ == "__main__":
    data_path = "data"
    prediction_length = 28
    ids = [
    'STORE_2_085', 
    'STORE_2_043', 
    'STORE_2_054', 
    'STORE_2_325',
    'STORE_2_090', 
    'Имитация айди без истории'
    ]
    predictor = SalesPredictor(data_path=data_path, prediction_length=prediction_length, store_item_ids=ids)
    predictions = predictor.run()