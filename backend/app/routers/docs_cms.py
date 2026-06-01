import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas

router = APIRouter(
    prefix="/docs-cms",
    tags=["CMS Documentation Engine"],
)

# ---------------------------------------------------------------------
# DOC SECTIONS CRUD (Global Scope)
# ---------------------------------------------------------------------

@router.get("/sections", response_model=List[schemas.DocSectionOut])
def get_sections(db: Session = Depends(database.get_db)):
    """
    Obtiene todas las secciones y páginas de documentación globales.
    """
    sections = db.query(models.DocSection)\
        .order_by(models.DocSection.position.asc())\
        .all()
    return sections

@router.post("/sections", response_model=schemas.DocSectionOut, status_code=201)
def create_section(payload: schemas.DocSectionCreate, db: Session = Depends(database.get_db)):
    """
    Crea una nueva sección global en el CMS de Documentación.
    """
    # Validar slug único global
    existing = db.query(models.DocSection)\
        .filter(models.DocSection.slug == payload.slug)\
        .first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una sección con este slug")

    db_section = models.DocSection(
        id=str(uuid.uuid4()),
        slug=payload.slug,
        title=payload.title,
        position=payload.position
    )
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section

@router.put("/sections/{section_id}", response_model=schemas.DocSectionOut)
def update_section(section_id: str, payload: schemas.DocSectionUpdate, db: Session = Depends(database.get_db)):
    """
    Actualiza una sección global existente.
    """
    db_section = db.query(models.DocSection)\
        .filter(models.DocSection.id == section_id)\
        .first()
    
    if not db_section:
        raise HTTPException(status_code=404, detail="Sección no encontrada")

    if payload.slug is not None:
        # Validar slug único global si cambió
        if payload.slug != db_section.slug:
            existing = db.query(models.DocSection)\
                .filter(models.DocSection.slug == payload.slug)\
                .first()
            if existing:
                raise HTTPException(status_code=409, detail="Ya existe una sección con este slug")
        db_section.slug = payload.slug
    
    if payload.title is not None:
        db_section.title = payload.title
    if payload.position is not None:
        db_section.position = payload.position

    db.commit()
    db.refresh(db_section)
    return db_section

@router.delete("/sections/{section_id}", status_code=200)
def delete_section(section_id: str, db: Session = Depends(database.get_db)):
    """
    Elimina una sección de documentación global.
    """
    db_section = db.query(models.DocSection)\
        .filter(models.DocSection.id == section_id)\
        .first()
    
    if not db_section:
        raise HTTPException(status_code=404, detail="Sección no encontrada")

    db.delete(db_section)
    db.commit()
    return {"status": "success", "message": "Sección de documentación eliminada"}

# ---------------------------------------------------------------------
# DOC PAGES CRUD (Global Scope)
# ---------------------------------------------------------------------

@router.get("/pages", response_model=List[schemas.DocPageOut])
def get_pages(db: Session = Depends(database.get_db)):
    """
    Lista todas las páginas de documentación globales.
    """
    pages = db.query(models.DocPage)\
        .order_by(models.DocPage.position.asc())\
        .all()
    return pages

@router.get("/pages/{slug}", response_model=schemas.DocPageOut)
def get_page_by_slug(slug: str, db: Session = Depends(database.get_db)):
    """
    Obtiene una página de documentación global específica por su slug.
    """
    db_page = db.query(models.DocPage)\
        .filter(models.DocPage.slug == slug)\
        .first()
    
    if not db_page:
        raise HTTPException(status_code=404, detail="Página no encontrada")
    return db_page

@router.post("/pages", response_model=schemas.DocPageOut, status_code=201)
def create_page(payload: schemas.DocPageCreate, db: Session = Depends(database.get_db)):
    """
    Crea una nueva página de documentación global.
    """
    # Validar sección
    db_section = db.query(models.DocSection)\
        .filter(models.DocSection.id == payload.section_id)\
        .first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Sección de destino no encontrada")

    # Validar slug único global
    existing = db.query(models.DocPage)\
        .filter(models.DocPage.slug == payload.slug)\
        .first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una página con este slug")

    db_page = models.DocPage(
        id=str(uuid.uuid4()),
        section_id=payload.section_id,
        slug=payload.slug,
        title=payload.title,
        content=payload.content,
        position=payload.position
    )
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page

@router.put("/pages/{page_id}", response_model=schemas.DocPageOut)
def update_page(page_id: str, payload: schemas.DocPageUpdate, db: Session = Depends(database.get_db)):
    """
    Actualiza una página de documentación global existente.
    """
    db_page = db.query(models.DocPage)\
        .filter(models.DocPage.id == page_id)\
        .first()
    
    if not db_page:
        raise HTTPException(status_code=404, detail="Página no encontrada")

    if payload.section_id is not None:
        db_section = db.query(models.DocSection)\
            .filter(models.DocSection.id == payload.section_id)\
            .first()
        if not db_section:
            raise HTTPException(status_code=404, detail="Sección no encontrada")
        db_page.section_id = payload.section_id

    if payload.slug is not None:
        if payload.slug != db_page.slug:
            existing = db.query(models.DocPage)\
                .filter(models.DocPage.slug == payload.slug)\
                .first()
            if existing:
                raise HTTPException(status_code=409, detail="Ya existe una página con este slug")
        db_page.slug = payload.slug

    if payload.title is not None:
        db_page.title = payload.title
    if payload.content is not None:
        db_page.content = payload.content
    if payload.position is not None:
        db_page.position = payload.position

    db.commit()
    db.refresh(db_page)
    return db_page

@router.delete("/pages/{page_id}", status_code=200)
def delete_page(page_id: str, db: Session = Depends(database.get_db)):
    """
    Elimina una página de documentación global.
    """
    db_page = db.query(models.DocPage)\
        .filter(models.DocPage.id == page_id)\
        .first()
    
    if not db_page:
        raise HTTPException(status_code=404, detail="Página no encontrada")

    db.delete(db_page)
    db.commit()
    return {"status": "success", "message": "Página de documentación eliminada"}
