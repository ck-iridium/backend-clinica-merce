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

    # Devolvemos todos, el frontend filtrará los is_visible si es para el menú público,
    # y el panel de administración verá también los ocultos para poder editarlos.
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
# ENDPOINTS BLOQUES DINÁMICOS
# ---------------------------------------------------------------------

@router.get("/blocks/{page_slug}", response_model=List[schemas.SiteBlockOut])
def get_blocks(page_slug: str, db: Session = Depends(database.get_db)):
    """
    Obtiene los bloques de construcción dinámicos para una página específica (ej. 'home').
    Si no existen bloques activos para este inquilino, inicializa una estructura por defecto
    para evitar renderizar una página vacía.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    blocks = db.query(models.SiteBlock)\
        .filter(models.SiteBlock.tenant_id == tenant_id, models.SiteBlock.page_slug == page_slug)\
        .order_by(models.SiteBlock.order_index.asc())\
        .all()

    # Si no hay bloques inicializados, inyectamos una maqueta por defecto
    if not blocks:
        default_blocks = [
            {
                "block_type": "hero_luxury",
                "order_index": 0,
                "content_data": {
                    "hero_title": "Descubre tu Mejor Versión",
                    "hero_subtitle": "Tratamientos estéticos avanzados y bienestar personalizado en un ambiente de calma.",
                    "hero_button_text": "Reservar Cita",
                    "hero_button_link": "/reservar",
                    "hero_alignment": "center",
                    "hero_horizontal_alignment": "center"
                }
            },
            {
                "block_type": "bento_grid",
                "order_index": 1,
                "content_data": {
                    "title": "Nuestros Tratamientos Insignia",
                    "subtitle": "Excelencia y tecnología médica estética de vanguardia.",
                    "max_services": 4
                }
            },
            {
                "block_type": "faq_accordion",
                "order_index": 2,
                "content_data": {
                    "title": "Preguntas Frecuentes",
                    "subtitle": "Resolvemos todas tus dudas previas al tratamiento.",
                    "faqs": [
                        {"q": "¿Con cuánto margen debo reservar?", "a": "Puedes reservar en línea con hasta 2 horas de anticipación según disponibilidad."},
                        {"q": "¿Puedo cancelar mi cita de forma autónoma?", "a": "Sí, a través de tu email de confirmación siempre que cumplas con el aviso previo de 24 horas."}
                    ]
                }
            }
        ]

        blocks = []
        for item in default_blocks:
            db_block = models.SiteBlock(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                page_slug=page_slug,
                block_type=item["block_type"],
                content_data=item["content_data"],
                order_index=item["order_index"]
            )
            db.add(db_block)
            blocks.append(db_block)
        
        db.commit()
        for item in blocks:
            db.refresh(item)

    return blocks
