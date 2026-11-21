"""Warehouse Inventory and Logistics Service.

Enforces transactional stock reservations, prevents overselling (quantity_reserved <= quantity_on_hand),
maintains an immutable movement audit trail, and generates low-stock replenishment alerts.
"""

import uuid
from decimal import Decimal
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.inventory import InventoryModel, InventoryMovementModel
from app.models.product import ProductModel
from app.schemas.product import ProductCreate
from app.schemas.inventory import InventoryStockAdjustRequest
from app.core.audit import record_audit_log


class InventoryService:
    """Business operations for warehouse stock and products."""

    @staticmethod
    def create_product(
        db: Session,
        payload: ProductCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ProductModel:
        """Register new hardware item in the master catalog."""
        existing = db.query(ProductModel).filter(ProductModel.sku == payload.sku.strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{payload.sku}' already exists",
            )

        product = ProductModel(
            id=uuid.uuid4(),
            sku=payload.sku.strip(),
            product_name=payload.product_name.strip(),
            brand=payload.brand.strip(),
            model=payload.model.strip(),
            category=payload.category.strip(),
            rated_power_w=payload.rated_power_w,
            voltage=payload.voltage,
            current=payload.current,
            technical_specifications=payload.technical_specifications or {},
            purchase_price=payload.purchase_price,
            selling_price=payload.selling_price,
            warranty_months=payload.warranty_months,
            is_active=payload.is_active,
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        record_audit_log(
            db=db,
            action="product_created",
            entity_type="products",
            entity_id=product.id,
            user_id=acting_user_id,
            metadata={"sku": product.sku, "category": product.category},
        )

        return product

    @staticmethod
    def list_products(
        db: Session,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
    ) -> Tuple[List[ProductModel], int]:
        """List catalog products with filtering."""
        query = db.query(ProductModel)

        if category:
            query = query.filter(ProductModel.category == category)
        if is_active is not None:
            query = query.filter(ProductModel.is_active == is_active)
        if search:
            query = query.filter(
                ProductModel.product_name.ilike(f"%{search.strip()}%")
                | ProductModel.sku.ilike(f"%{search.strip()}%")
                | ProductModel.brand.ilike(f"%{search.strip()}%")
            )

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(ProductModel.product_name.asc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def list_stock(
        db: Session,
        warehouse_name: Optional[str] = None,
        low_stock_only: bool = False,
    ) -> List[InventoryModel]:
        """List stock levels across warehouses."""
        query = db.query(InventoryModel).options(joinedload(InventoryModel.product))

        if warehouse_name:
            query = query.filter(InventoryModel.warehouse_name == warehouse_name)

        items = query.all()

        if low_stock_only:
            # Filter available stock <= reorder_level
            items = [i for i in items if i.available_stock <= i.reorder_level]

        return items

    @staticmethod
    def adjust_stock(
        db: Session,
        product_id: uuid.UUID,
        payload: InventoryStockAdjustRequest,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> InventoryModel:
        """Adjust, reserve, or release warehouse inventory using strict atomic transaction.
        
        Prevents overselling by ensuring quantity_reserved <= quantity_on_hand at all times.
        """
        # Lock or fetch inventory record
        inventory = (
            db.query(InventoryModel)
            .filter(
                InventoryModel.product_id == product_id,
                InventoryModel.warehouse_name == payload.warehouse_name,
            )
            .with_for_update()
            .first()
        )

        qty = Decimal(str(payload.quantity))
        action = payload.action.lower().strip()

        if not inventory:
            if action in ("reserve", "release"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot {action} stock: No inventory record exists for product in warehouse '{payload.warehouse_name}'",
                )
            # Create new inventory record
            inventory = InventoryModel(
                id=uuid.uuid4(),
                product_id=product_id,
                warehouse_name=payload.warehouse_name,
                quantity_on_hand=Decimal("0.00"),
                quantity_reserved=Decimal("0.00"),
            )
            db.add(inventory)
            db.flush()

        movement_type = "adjustment"
        if action == "adjust":
            # Add or modify on-hand quantity
            inventory.quantity_on_hand += qty
            movement_type = "purchase" if qty > 0 else "adjustment"

        elif action == "reserve":
            # Check available stock before reserving to PREVENT OVERSELLING
            available = inventory.quantity_on_hand - inventory.quantity_reserved
            if qty > available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock to reserve {qty} units. On hand: {inventory.quantity_on_hand}, Reserved: {inventory.quantity_reserved}, Available: {available}",
                )
            inventory.quantity_reserved += qty
            movement_type = "reservation"

        elif action == "release":
            if qty > inventory.quantity_reserved:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot release {qty} units: only {inventory.quantity_reserved} currently reserved",
                )
            inventory.quantity_reserved -= qty
            movement_type = "release"

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown stock action '{payload.action}'. Use 'adjust', 'reserve', or 'release'",
            )

        # Enforce check constraint: quantity_reserved <= quantity_on_hand
        if inventory.quantity_reserved > inventory.quantity_on_hand:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction rejected: reserved stock exceeds stock on hand",
            )

        # Record movement in immutable ledger
        movement = InventoryMovementModel(
            id=uuid.uuid4(),
            product_id=product_id,
            inventory_id=inventory.id,
            movement_type=movement_type,
            quantity=abs(qty),
            reference_type=payload.reference_type,
            reference_id=payload.reference_id,
            performed_by=acting_user_id,
            notes=payload.notes,
        )
        db.add(movement)

        record_audit_log(
            db=db,
            action=f"inventory_{action}",
            entity_type="inventory",
            entity_id=inventory.id,
            user_id=acting_user_id,
            metadata={"product_id": str(product_id), "quantity": str(qty), "action": action},
        )

        db.commit()
        db.refresh(inventory)
        return inventory

    @staticmethod
    def list_movements(
        db: Session,
        product_id: Optional[uuid.UUID] = None,
        movement_type: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[InventoryMovementModel], int]:
        """List immutable stock movements."""
        query = db.query(InventoryMovementModel)

        if product_id:
            query = query.filter(InventoryMovementModel.product_id == product_id)
        if movement_type:
            query = query.filter(InventoryMovementModel.movement_type == movement_type)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(InventoryMovementModel.created_at.desc()).offset(offset).limit(limit).all()
        return items, total
