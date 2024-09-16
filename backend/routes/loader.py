""" Loader Module """
import requests
import tempfile
from typing import List
from zipfile import ZipFile

# Data Processing
import pandas as pd

# FastAPI
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status

# SQL Connections
import sqlalchemy
from database.connection import get_session

# Local Imports - Services
from services import sales as SalesService
from services import prices as PricesService
from services import sales_dates as SalesDatesService
from services import decomposition as DecompositionService
from services import clustering as ClusteringService

# Local Imports - Models
from models.prediction import Prediction
from models.clustering import ClusteringItem
from models.decomposition import Decomposition, DecompositionItem


loader_router = APIRouter(tags=["DataLoader"])

DATA_PATH = "zip_data"


@loader_router.post("/upload_data")
async def upload_data(file: UploadFile = File(...), session=Depends(get_session)):       # noqa: B008
    print("upload_data ", file)

    if file.filename.endswith('.zip') == False:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Переданный файл должен быть .zip архивом")

    with tempfile.NamedTemporaryFile(suffix=".zip") as temp_zip:
        temp_zip.write(await file.read())
        temp_zip.flush()

        with ZipFile(temp_zip.name, 'r') as zip_ref:
            zip_ref.extractall(DATA_PATH)

    load_file(PricesService.create_prices, DATA_PATH+"/shop_sales_prices.csv")
    load_file(SalesService.create_sales, DATA_PATH+"/shop_sales.csv")
    load_file(SalesDatesService.create_sales_dates, DATA_PATH + "/shop_sales_dates.csv")

    max_date = SalesDatesService.get_max_date(session)
    print("max_date", max_date)

    df = pd.read_csv(DATA_PATH + "/shop_sales_prices.csv")
    unique_item_ids = df['item_id'].drop_duplicates().tolist()

    print(unique_item_ids)

    url = "http://84.201.147.115:9080/prediction/delete_prediction"
    response = requests.get(url)

    url = "http://84.201.147.115:9080/prediction/predict"

    body = {
        "prediction_date": max_date.strftime("%Y-%m-%d"),
        "items_id": unique_item_ids
    }

    print("body", body)

    response = requests.post(url, json=body)

    if response.status_code == 200:
        return {"message": "все хорошо, данные обработались"}

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="При обработке данных произошла ошибка")


@loader_router.get("/get_decomposition", response_model=List[DecompositionItem])
async def get_decomposition(store_id_item: str, session=Depends(get_session)):
    """ get_decomposition """
    result = DecompositionService.get_dataframe(store_id_item, session)
    return result


@loader_router.get("/get_clustering", response_model=List[ClusteringItem])
async def get_clustering(cluster: int, store_id: str, session=Depends(get_session)):
    """ get_clustering """
    result = ClusteringService.get_dataframe(cluster, store_id, session)
    return result


@loader_router.get("/get_clusters", response_model=List[int])
async def get_clusters(session=Depends(get_session)):
    """ get_clusters """
    result = ClusteringService.get_clusters(session)
    print("result", result)
    return result


@loader_router.get("/get_clusters_items", response_model=List[int])
async def get_clusters_items(cluster: int, store_id: str, session=Depends(get_session)):
    """ get_clusters_items """
    result = ClusteringService.get_clusters_items(cluster, store_id, session)
    print("result", result)
    return result


@loader_router.get("/delete_data")
async def delete_data(session=Depends(get_session)):
    """ delete_data """
    PricesService.delete_data(session)
    SalesService.delete_data(session)
    SalesDatesService.delete_data(session)
    return {"message":"данные успешно удалены"}


def load_file(func, file_path):
    """ load_file """
    try:
        func(file_path)
    except sqlalchemy.exc.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="В файле "+file_path+" содержится информация, которая уже загружалась ранее")
    except sqlalchemy.exc.ProgrammingError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="В файле "+file_path+" неправильный формат колонок")
