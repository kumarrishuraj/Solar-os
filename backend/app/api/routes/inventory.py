"""Warehouse Inventory and Stock Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, require_roles, AuthenticatedUser
from app.schemas.product import ProductCreate, ProductResponse
from app.schemas.inventory import (
    InventoryStockAdjustRequest,
    InventoryStockResponse,
    InventoryMovementResponse,
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Warehouse & Inventory"])


@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Catalog Product",
    description="Registers new hardware product item (panel, inverter, battery, BOS).",
)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ProductResponse:
    """Register product."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    prod = InventoryService.create_product(db, payload, acting_user_id=user_id)
    return ProductResponse.model_validate(prod)


@router.get(
    "/products",
    response_model=List[ProductResponse],
    summary="List Catalog Products",
    description="Returns hardware catalog with category and search filtering.",
)
def list_products(
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[ProductResponse]:
    """List products."""
    items, _ = InventoryService.list_products(
        db=db,
        category=category,
        is_active=is_active,
        search=search,
        page=page,
        limit=limit,
    )
    return [ProductResponse.model_validate(p) for p in items]


@router.get(
    "/stock",
    response_model=List[InventoryStockResponse],
    summary="Get Warehouse Stock Levels",
    description="Returns real-time stock levels. available_stock = quantity_on_hand - quantity_reserved.",
)
def get_stock(
    warehouse_name: Optional[str] = Query(None),
    low_stock_only: bool = Query(False, description="Filter items at or below reorder threshold"),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[InventoryStockResponse]:
    """Get stock levels."""
    items = InventoryService.list_stock(db, warehouse_name=warehouse_name, low_stock_only=low_stock_only)
    return [
        InventoryStockResponse(
            id=i.id,
            product_id=i.product_id,
            warehouse_name=i.warehouse_name,
            quantity_on_hand=i.quantity_on_hand,
            quantity_reserved=i.quantity_reserved,
            available_stock=i.available_stock,
            reorder_level=i.reorder_level,
            updated_at=i.updated_at,
            product=ProductResponse.model_validate(i.product) if i.product else None,
        )
        for i in items
    ]


@router.patch(
    "/stock/{product_id}",
    response_model=InventoryStockResponse,
    summary="Adjust, Reserve, or Release Stock",
    description="Performs transactional stock adjustments. Enforces available stock constraints to prevent overselling.",
)
def adjust_stock(
    product_id: uuid.UUID,
    payload: InventoryStockAdjustRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> InventoryStockResponse:
    """Adjust or reserve stock."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    item = InventoryService.adjust_stock(
        db=db,
        product_id=product_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return InventoryStockResponse(
        id=item.id,
        product_id=item.product_id,
        warehouse_name=item.warehouse_name,
        quantity_on_hand=item.quantity_on_hand,
        quantity_reserved=item.quantity_reserved,
        available_stock=item.available_stock,
        reorder_level=item.reorder_level,
        updated_at=item.updated_at,
        product=ProductResponse.model_validate(item.product) if item.product else None,
    )


@router.get(
    "/movements",
    response_model=List[InventoryMovementResponse],
    summary="List Stock Movements",
    description="Returns immutable warehouse stock ledger entries.",
)
def list_movements(
    product_id: Optional[uuid.UUID] = Query(None),
    movement_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[InventoryMovementResponse]:
    """List movements."""
    items, _ = InventoryService.list_movements(
        db=db,
        product_id=product_id,
        movement_type=movement_type,
        page=page,
        limit=limit,
    )
    return [InventoryMovementResponse.model_validate(m) for m in items]
