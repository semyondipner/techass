""" Пример ручки для Аналитического Dashboard """
# Data Processing
import json
import numpy as np # For Anomaly get_charts
import pandas as pd

# DataBase Management
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Table, Column, Integer, String, MetaData

# from dotenv import load_dotenv
# load_dotenv()

QUERY = r"""
with main as (
    select
        s.date_id,
        sd.wm_yr_wk,
        sd.date,
        s.store_id,
        s.item_id,
        s.cnt
    from sale as s
        left join salesdate as sd
            on sd.date_id = s.date_id
)
select
    m.date,
    m.store_id,
    m.item_id,
    m.cnt,
    p.sell_price,
    m.cnt * p.sell_price as "gmv"
from main as m
    left join price as p
        using ("wm_yr_wk", "store_id", "item_id")
where
    m.date between
    ('{date_srt}'::timestamp at time zone 'Asia/Almaty') and
    ('{date_end}'::timestamp at time zone 'Asia/Almaty')
order by 1, 2, 3 asc
"""

def prepare_df(df: pd.DataFrame, index_list: list[str]):
    """ Prepare DF for Anomaly Detection """
    level_counter = len(index_list)
    df = df.set_index(index_list).stack().reset_index().rename(columns={
        f"level_{level_counter}": "metric",
        0: "value"
    })
    df = df.groupby(["metric", *index_list])["value"].sum().reset_index()
    return df.copy()

def get_anomalies(df: pd.DataFrame, groupby_list: list[str]):
    """
    Input:
        Prepared DF.
    Output:
        pd.DataFrame with anomalies.
    """
    # ROLLING MEAN
    df["rolling_mean"] = (
        df
        .groupby(groupby_list)
        ['value']
        .rolling(5)
        .mean()
        .reset_index(drop=True)
    )
    # STD
    df = df.merge(
        right=round(df.groupby(groupby_list)["value"].std()).reset_index()
        .rename(columns={"value": "std"}), on=groupby_list, how="left")
    df = df[df["std"] > 1].copy()
    # Upper/Lower Bounds
    df["upper_bound"] = df["rolling_mean"] + (df["std"] * 2.57)
    df["lower_bound"] = df["rolling_mean"] - (df["std"] * 2.57)
    df["indicator"] = np.where(
        df["value"] > df["upper_bound"], 1,
        np.where(
            df["value"] < df["lower_bound"], -1,
            0
        )
    )
    df["deviation%"] = round(((df["value"] / df["rolling_mean"]) - 1) * 100)
    return df

def get_dataset(
        date_str: str, 
        date_end: str,
        store_id: str | list[str],
        items_id: str | list[str]
    ) -> pd.DataFrame:
    query = QUERY + " "
    query = query.format(
        date_srt="2011-01-29",
        date_end="2015-01-21"
    )
    engine = create_engine(
    'postgresql+psycopg2://techass:techass987@51.250.39.116:5432/techass',
    client_encoding='utf8',
    echo=False
    )
    session = Session(engine)
    data = session.execute(text(query))
    df = pd.DataFrame(data, columns=data.keys())
    session.close()

    if (store_id == 'All') and (items_id == 'All'):
        return df
    elif (store_id != 'All') and (items_id != 'All'):
        return df[
            df["store_id"].isin(store_id)
            & df["item_id"].isin(items_id)
            ].copy()
    else:
        if (store_id != 'All'):
            return df[df["store_id"].isin(store_id)].copy()
        else:
            return df[df["item_id"].isin(items_id)].copy()
    return df

def get_kpi(df: pd.DataFrame) -> dict:
    kpi_json = round(
        df
        .agg({
            "store_id": "nunique",
            "item_id": "nunique",
            "cnt": "sum",
            "gmv": "sum"
        })
        .rename({
            "store_id": "num_uniq_shops",
            "item_id": "num_uniq_items",
            "cnt": "total_sales",
            "gmv": "total_gmv"
        })
    ).to_dict()
    return kpi_json

def get_tables(df: pd.DataFrame) -> dict:
    table_shop_sales = (
    df
    .groupby(["store_id"])
    .agg(
        uniq_item_sale=('item_id', 'nunique'),
        sales=('cnt', 'sum'),
        gmv=('gmv', 'sum')
    )
    .sort_values("sales", ascending=False)
    .reset_index()
    .to_dict('split')
    )
    table_item_sales = (
    df
    .groupby(["item_id"])
    .agg(
        uniq_item_sale=('store_id', 'nunique'),
        sales=('cnt', 'sum'),
        gmv=('gmv', 'sum')
    )
    .sort_values("sales", ascending=False)
    .reset_index()
    .to_dict('split')
    )
    table_shop_item_sales = (
    df
    .groupby(["store_id", "item_id"])
    .agg(
        sales=('cnt', 'sum'),
        gmv=('gmv', 'sum')
    )
    .sort_values("sales", ascending=False)
    .reset_index()
    .to_dict('split')
    )
    return {
        "table_shop_sales": table_shop_sales,
        "table_item_sales": table_item_sales,
        "table_shop_item_sales": table_shop_item_sales
    }

def get_charts(df: pd.DataFrame) -> dict:
    dynamics_df = df.groupby(["date"]).agg({col: "sum" for col in ["cnt", "gmv"]}).reset_index()
    dynamics_df = prepare_df(dynamics_df, index_list=["date"])
    anomalies_df = get_anomalies(dynamics_df, groupby_list=["metric"])
    anomalies_df.drop(columns=["std"], inplace=True)
    sales_dynamics = (
        anomalies_df
        [anomalies_df["metric"] == "cnt"]
        .reset_index(drop=True)
        .drop(columns=["metric"])
        .to_dict('split')
    )
    gmv_dynamics = (
        anomalies_df
        [anomalies_df["metric"] == "gmv"]
        .reset_index(drop=True)
        .drop(columns=["metric"])
        .to_dict('split')
    )
    return {
        "sales_dynamics": sales_dynamics,
        "gmv_dynamics": gmv_dynamics
    }

app.get('/analytical_dashboard?{date_str}?{date_end}?{store_id}?{items_id}')
async def analytical_dashboard():
    # Get Parameters
    request_ = json.loads(request.json)
    date_str = request_['date_str']
    date_end = request_['date_end']
    store_id = request_['store_id']
    items_id = request_['items_id']
    # Prepare Response
    df = get_dataset(
        date_str, date_end,
        store_id, items_id
    )
    kpi_json = get_kpi(df)
    tables_json = get_tables(df)
    charts_json = get_charts(df)
    return {
        "kpi": kpi_json,
        "tables": tables_json,
        "charts": charts_json
    }


# if __name__ == "__main__":
# Приходит параметрами с Frontend
# date_str = "2011-01-01" 
# date_end = "2011-02-01"
# store_id = 'All'
# items_id = 'All'
# store_id = ["STORE_1", "STORE_2"]
# items_id = ["STORE_1_090"]
# df = get_dataset(
#     date_str, date_end,
#     store_id, items_id
# )
# kpi_json = get_kpi(df)
# tables_json = get_tables(df)
# charts_json = get_charts(df)
# Получаем для начала общий датасет