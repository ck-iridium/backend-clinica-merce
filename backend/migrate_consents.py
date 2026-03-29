from app.database import engine
from app.models import Consent

Consent.__table__.create(bind=engine, checkfirst=True)
print("Migración de Consent completada")
