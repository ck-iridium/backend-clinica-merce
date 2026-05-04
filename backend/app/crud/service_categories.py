from sqlalchemy.orm import Session
from .. import models, schemas

# Service Categories
def get_service_category(db: Session, category_id: str):
    return db.query(models.ServiceCategory).filter(models.ServiceCategory.id == category_id).first()

def get_service_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ServiceCategory).offset(skip).limit(limit).all()

def create_service_category(db: Session, category: schemas.ServiceCategoryCreate):
    db_category = models.ServiceCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_service_category(db: Session, category_id: str, category: schemas.ServiceCategoryUpdate):
    db_category = db.query(models.ServiceCategory).filter(models.ServiceCategory.id == category_id).first()
    if db_category:
        update_data = category.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_service_category(db: Session, category_id: str):
    db_category = db.query(models.ServiceCategory).filter(models.ServiceCategory.id == category_id).first()
    if db_category:
        # Prevent deletion if there are services attached, or alternatively set their category to null.
        # Let's set services category to null if the category is deleted
        for service in db_category.services:
            service.category_id = None
        db.delete(db_category)
        db.commit()
    return db_category
