from sqlalchemy.orm import Session
from .. import models, schemas

# --- SITE CONTENT (CMS) ---
def get_site_content(db: Session):
    try:
        content = db.query(models.SiteContent).first()
    except Exception:
        db.rollback()
        from ..utils.migrations import run_auto_migrations
        run_auto_migrations()
        content = db.query(models.SiteContent).first()

    if not content:
        content = models.SiteContent(id=1)
        db.add(content)
        db.commit()
        db.refresh(content)
    return content

def update_site_content(db: Session, update_data: schemas.SiteContentUpdate):
    content = get_site_content(db)
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(content, key, value)
    db.commit()
    db.refresh(content)
    return content
