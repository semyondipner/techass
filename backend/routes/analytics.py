from fastapi import APIRouter, Depends, HTTPException, status
from backend.models.sales import Store, Item
from typing import List
from backend.database.connection import get_session
from backend.services import sales as SalesService

analytics_router = APIRouter(tags=["Analytics"])


@analytics_router.get("/get_stores", response_model=List[Store])
async def get_stores(session=Depends(get_session)):
    stores = SalesService.get_stores(session)
    return stores


@analytics_router.get("/get_items", response_model=List[Item])
async def get_items(session=Depends(get_session)):
    items = SalesService.get_items(session)
    return items
