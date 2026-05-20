import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas
from ..database import current_tenant_var

router = APIRouter(
    prefix="/cms",
    tags=["CMS Dynamic Modular Engine"],
)

# ---------------------------------------------------------------------
# ENDPOINTS NAVEGACIÓN DINÁMICA
# ---------------------------------------------------------------------

@router.get("/navigation", response_model=List[schemas.NavigationItemOut])
def get_navigation(db: Session = Depends(database.get_db)):
    """
    Obtiene los elementos de navegación para el Tenant actual.
    Si la base de datos está vacía, genera e inserta automáticamente los elementos por defecto (fallback).
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    nav_items = db.query(models.SiteNavigation)\
        .filter(models.SiteNavigation.tenant_id == tenant_id)\
        .order_by(models.SiteNavigation.order_index.asc())\
        .all()

    # Si está vacío (inquilino nuevo), inyectamos los elementos por defecto de marca blanca
    if not nav_items:
        fallback_items = [
            {"label": "Inicio", "path": "/", "order_index": 0},
            {"label": "Servicios", "path": "/services", "order_index": 1},
            {"label": "Contacto", "path": "/contacto", "order_index": 2}
        ]

        nav_items = []
        for idx, item in enumerate(fallback_items):
            db_item = models.SiteNavigation(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                label=item["label"],
                path=item["path"],
                order_index=item["order_index"],
                is_visible=True,
                is_custom=False
            )
            db.add(db_item)
            nav_items.append(db_item)

        db.commit()
        for item in nav_items:
            db.refresh(item)

    # Devolvemos todos; el frontend filtra is_visible para la web pública
    return nav_items


@router.post("/navigation/reorder")
def reorder_navigation(payload: schemas.NavigationReorderRequest, db: Session = Depends(database.get_db)):
    """
    Actualiza el orden de los elementos del menú por lote.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    for index, item_id in enumerate(payload.ids):
        db_item = db.query(models.SiteNavigation)\
            .filter(models.SiteNavigation.id == item_id, models.SiteNavigation.tenant_id == tenant_id)\
            .first()
        if db_item:
            db_item.order_index = index

    db.commit()
    return {"status": "success", "message": "Navegación reordenada correctamente"}


@router.put("/navigation/{item_id}", response_model=schemas.NavigationItemOut)
def update_navigation(item_id: str, payload: schemas.NavigationUpdateRequest, db: Session = Depends(database.get_db)):
    """
    Permite modificar las etiquetas y estados de visibilidad de los elementos del menú.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    db_item = db.query(models.SiteNavigation)\
        .filter(models.SiteNavigation.id == item_id, models.SiteNavigation.tenant_id == tenant_id)\
        .first()

    if not db_item:
        raise HTTPException(status_code=404, detail="Elemento de navegación no encontrado")

    if payload.label is not None:
        db_item.label = payload.label
    if payload.is_visible is not None:
        db_item.is_visible = payload.is_visible

    db.commit()
    db.refresh(db_item)
    return db_item


# ---------------------------------------------------------------------
# ENDPOINTS PÁGINAS PERSONALIZADAS (CRUD)
# ---------------------------------------------------------------------

@router.get("/pages", response_model=List[schemas.CustomPageOut])
def list_pages(db: Session = Depends(database.get_db)):
    """
    Devuelve todas las páginas personalizadas del tenant (is_custom=True en site_navigation).
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    pages = db.query(models.SiteNavigation)\
        .filter(
            models.SiteNavigation.tenant_id == tenant_id,
            models.SiteNavigation.is_custom == True
        )\
        .order_by(models.SiteNavigation.order_index.asc())\
        .all()

    return pages


@router.post("/pages", response_model=schemas.CustomPageOut, status_code=201)
def create_page(payload: schemas.CustomPageCreate, db: Session = Depends(database.get_db)):
    """
    Crea una nueva página personalizada y genera automáticamente su enlace en site_navigation.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    # Verificar slug único por tenant
    existing = db.query(models.SiteNavigation)\
        .filter(
            models.SiteNavigation.tenant_id == tenant_id,
            models.SiteNavigation.path == f"/{payload.slug}"
        ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una página con esa URL (slug)")

    # Calcular el siguiente order_index
    max_order = db.query(models.SiteNavigation)\
        .filter(models.SiteNavigation.tenant_id == tenant_id)\
        .count()

    # Crear el enlace en site_navigation (is_custom=True)
    nav_item = models.SiteNavigation(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        label=payload.title,
        path=f"/{payload.slug}",
        is_visible=payload.is_visible,
        order_index=max_order,
        is_custom=True
    )
    db.add(nav_item)
    db.commit()
    db.refresh(nav_item)
    return nav_item


@router.delete("/pages/{slug}", status_code=200)
def delete_page(slug: str, db: Session = Depends(database.get_db)):
    """
    Elimina una página personalizada, todos sus bloques y su enlace del menú de navegación.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    nav_item = db.query(models.SiteNavigation)\
        .filter(
            models.SiteNavigation.tenant_id == tenant_id,
            models.SiteNavigation.path == f"/{slug}",
            models.SiteNavigation.is_custom == True
        ).first()
    if not nav_item:
        raise HTTPException(status_code=404, detail="Página no encontrada")

    # Eliminar todos los bloques de esta página
    db.query(models.SiteBlock)\
        .filter(
            models.SiteBlock.tenant_id == tenant_id,
            models.SiteBlock.page_slug == slug
        ).delete(synchronize_session=False)

    # Eliminar el enlace del menú
    db.delete(nav_item)
    db.commit()
    return {"status": "success", "message": f"Página '/{slug}' y sus bloques eliminados correctamente"}


# ---------------------------------------------------------------------
# ENDPOINTS BLOQUES DINÁMICOS (CRUD completo)
# ---------------------------------------------------------------------

@router.get("/blocks/{page_slug}", response_model=List[schemas.SiteBlockOut])
def get_blocks(page_slug: str, db: Session = Depends(database.get_db)):
    """
    Obtiene los bloques para una página específica ordenados por order_index.
    Para páginas personalizadas devuelve vacío si no hay bloques (sin defaults).
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    blocks = db.query(models.SiteBlock)\
        .filter(models.SiteBlock.tenant_id == tenant_id, models.SiteBlock.page_slug == page_slug)\
        .order_by(models.SiteBlock.order_index.asc())\
        .all()

    return blocks


@router.post("/blocks/reorder")
def reorder_blocks(payload: schemas.BlockReorderRequest, db: Session = Depends(database.get_db)):
    """
    Reordena los bloques de una página por lote (array de IDs en nuevo orden).
    IMPORTANTE: debe ir antes de /blocks/{block_id} para que el router no confunda 'reorder' con un ID.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    for index, block_id in enumerate(payload.ids):
        db_block = db.query(models.SiteBlock)\
            .filter(models.SiteBlock.id == block_id, models.SiteBlock.tenant_id == tenant_id)\
            .first()
        if db_block:
            db_block.order_index = index

    db.commit()
    return {"status": "success", "message": "Bloques reordenados correctamente"}


@router.post("/blocks", response_model=schemas.SiteBlockOut, status_code=201)
def create_block(payload: schemas.SiteBlockCreate, db: Session = Depends(database.get_db)):
    """
    Crea un nuevo bloque de contenido en una página personalizada.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    # Calcular order_index al final si no se especifica
    max_order = db.query(models.SiteBlock)\
        .filter(
            models.SiteBlock.tenant_id == tenant_id,
            models.SiteBlock.page_slug == payload.page_slug
        ).count()

    db_block = models.SiteBlock(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        page_slug=payload.page_slug,
        block_type=payload.block_type,
        content_data=payload.content_data,
        order_index=payload.order_index if payload.order_index is not None else max_order
    )
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block


@router.put("/blocks/{block_id}", response_model=schemas.SiteBlockOut)
def update_block(block_id: str, payload: schemas.SiteBlockUpdate, db: Session = Depends(database.get_db)):
    """
    Actualiza el contenido de un bloque existente.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    db_block = db.query(models.SiteBlock)\
        .filter(models.SiteBlock.id == block_id, models.SiteBlock.tenant_id == tenant_id)\
        .first()
    if not db_block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")

    if payload.content_data is not None:
        db_block.content_data = payload.content_data
    if payload.block_type is not None:
        db_block.block_type = payload.block_type
    if payload.order_index is not None:
        db_block.order_index = payload.order_index

    db.commit()
    db.refresh(db_block)
    return db_block


@router.delete("/blocks/{block_id}", status_code=200)
def delete_block(block_id: str, db: Session = Depends(database.get_db)):
    """
    Elimina un bloque de contenido.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    db_block = db.query(models.SiteBlock)\
        .filter(models.SiteBlock.id == block_id, models.SiteBlock.tenant_id == tenant_id)\
        .first()
    if not db_block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")

    db.delete(db_block)
    db.commit()
    return {"status": "success", "message": "Bloque eliminado correctamente"}
