""" Analytics Dashboard """
from typing import List

# Data Processing
import json
import numpy as np # For Anomaly get_charts
import pandas as pd

# DataBase Management
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Table, Column, Integer, String, MetaData

# Fast API
from fastapi import APIRouter, Depends, HTTPException, status

# Local Imports 
from models.sales import Store, Item
from models.analytics import AnalyticsPredictions

from services import sales as SalesService
from database.connection import get_session


analytics_router = APIRouter(tags=["Analytics"])

@analytics_router.get("/get_stores", response_model=List[Store])
async def get_stores(session=Depends(get_session)):
    """ Get Stores for a selector in the Dashboard """
    stores = SalesService.get_stores(session)
    return stores

@analytics_router.get("/get_items", response_model=List[Item])
async def get_items(session=Depends(get_session)):
    """ Get Items for a selector in the Dashboard """
    items = SalesService.get_items(session)
    return items


# =======================
#           SQL
# =======================
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

# =======================
#    SUPPORT FUNCTIONS
# =======================
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
        date_srt=date_str,
        date_end=date_end
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
    return {
        "kpi": kpi_json
    }

def get_tables(df: pd.DataFrame) -> dict:
    table_shop_sales = round(
    df
    .groupby(["store_id"])
    .agg(
        uniq_item_sale=('item_id', 'nunique'),
        sales=('cnt', 'sum'),
        gmv=('gmv', 'sum')
    )
    .sort_values("sales", ascending=False)
    .reset_index()
    ).to_dict('split')
    table_item_sales = round(
    df
    .groupby(["item_id"])
    .agg(
        uniq_item_sale=('store_id', 'nunique'), # uniq_store_sale
        sales=('cnt', 'sum'),
        gmv=('gmv', 'sum')
    )
    .sort_values("sales", ascending=False)
    .reset_index()
    ).to_dict('split')
    table_shop_item_sales = round(
    df
    .groupby(["store_id", "item_id"])
    .agg(
        sales=('cnt', 'sum'),
        gmv=('gmv', 'sum')
    )
    .sort_values("sales", ascending=False)
    .reset_index()
    ).to_dict('split')
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
    sales_dynamics = round(
        anomalies_df
        [anomalies_df["metric"] == "cnt"]
        .drop(columns=["metric"])
        .reset_index(drop=True)
        .fillna(0)
    ).to_dict('split')
    gmv_dynamics = round(
        anomalies_df
        [anomalies_df["metric"] == "gmv"]
        .drop(columns=["metric"])
        .reset_index(drop=True)
        .fillna(0)
    ).to_dict('split')
    return {
        "sales_dynamics": sales_dynamics,
        "gmv_dynamics": gmv_dynamics
    }

# ==========================
#    MAIN FUNCTIONS-ARMS
# ==========================

@analytics_router.post("/get_kpis")
async def get_kpis_arm(request: AnalyticsPredictions):
    """ KPI """
    df = get_dataset(
        request.date_str, request.date_end,
        request.store_ids, request.items_ids
    )
    return get_kpi(df)

@analytics_router.post("/get_tables")
async def get_tables_arm(request: AnalyticsPredictions):
    """ TABLES """
    df = get_dataset(
        request.date_str, request.date_end,
        request.store_ids, request.items_ids
    )
    return get_tables(df)

@analytics_router.post("/get_charts")
async def get_charts_arm(request: AnalyticsPredictions):
    """ Charts with Anomaly Detection """
    df = get_dataset(
        request.date_str, request.date_end,
        request.store_ids, request.items_ids
    )
    return get_charts(df)
