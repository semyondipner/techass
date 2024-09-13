import pandas as pd
import numpy as np
from scipy.fftpack import fft, ifft

class TimeSeriesAnalyzer:
    def __init__(self, data_path: str, window_size: int = 30, freq_cutoff: int = 50):

        self.data_path = data_path
        self.window_size = window_size
        self.freq_cutoff = freq_cutoff
        self.train = None

    def get_historical_data(self) -> pd.DataFrame:

        # Загрузка данных
        train = pd.read_csv(f"{self.data_path}/shop_sales.csv")
        dates_df = pd.read_csv(f"{self.data_path}/shop_sales_dates.csv")
        
        # Объединение и предобработка данных 
        train = train.merge(dates_df[['date', 'date_id', 'year', 'wm_yr_wk']], on='date_id')
        train['store_item_id'] = train.item_id
        train.item_id = train.item_id.apply(lambda x: x.split('_')[-1])
        
        self.train = train
        return train

    def get_seasonality_trend(self) -> pd.DataFrame:

        res = pd.DataFrame()

        for store_item_id in self.train.store_item_id.unique():
            store_item_id_df = self.train[self.train.store_item_id == store_item_id].copy()
            store_item_id_df = store_item_id_df[store_item_id_df.date >= "2015-01-01"]

            trend = store_item_id_df.cnt.rolling(window=self.window_size, center=False).mean()
            store_item_id_df['trend'] = trend
            store_item_id_df = store_item_id_df.dropna()


            fft_result = fft((store_item_id_df.cnt - store_item_id_df.trend).values)
            fft_result_filtered = np.copy(fft_result)
            fft_result_filtered[self.freq_cutoff:] = 0  
            
            seasonality = np.real(ifft(fft_result_filtered))
            store_item_id_df['seasonality'] = seasonality
            
            res = pd.concat([res, store_item_id_df])
        
        return res

    def run(self) -> pd.DataFrame:

        self.get_historical_data()
        return self.get_seasonality_trend()


if __name__ == "__main__":
    data_path = "data"  

    analyzer = TimeSeriesAnalyzer(
        data_path=data_path,
        window_size=30,
        freq_cutoff=50
    )
    result = analyzer.run()
