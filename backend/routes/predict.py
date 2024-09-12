from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from models.prediction import Prediction
from database.connection import get_session
from services import prices as PricesService
from services import sales_dates as SalesDatesService
from services import sales as SalesService
from zipfile import ZipFile
import tempfile
import sqlalchemy

predict_router = APIRouter(tags=["Predict"])

DATA_PATH = "zip_data"


@predict_router.get("/predict", response_model=Prediction)
async def predict():
    info = "Наше предсказание"
    return Prediction(prediction=info)


@predict_router.post("/upload_data", response_model=Prediction)
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

    return Prediction(prediction="Файл обработан")


def load_file(func, file_path):
    try:
        func(file_path)
    except sqlalchemy.exc.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="В файле "+file_path+" содержится инфомация, которая уже загружалась ранее")
    except sqlalchemy.exc.ProgrammingError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="В файле "+file_path+" неправильный формат колонок")
