import os
import sys
import uuid

# Aseguramos que Python encuentre el módulo app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Service, ServiceCategory

def run():
    db = SessionLocal()
    try:
        print("Iniciando migración de categorías de servicios...")
        
        # 1. Asegurar la categoría 'General'
        gen_cat = db.query(ServiceCategory).filter(ServiceCategory.name == "General").first()
        if not gen_cat:
            gen_cat = ServiceCategory(id=str(uuid.uuid4()), name="General")
            db.add(gen_cat)
            db.commit()
            db.refresh(gen_cat)
            print("✅ Categoría 'General' creada con éxito.")
        else:
            print("ℹ️ Categoría 'General' ya existía.")
            
        # 2. Migrar servicios huérfanos
        services = db.query(Service).filter(Service.category_id == None).all()
        if services:
            for svc in services:
                svc.category_id = gen_cat.id
                if getattr(svc, 'is_featured', None) is None:
                    svc.is_featured = False
            db.commit()
            print(f"✅ Migración completada: {len(services)} servicios actualizados a la categoría 'General'.")
        else:
            print("✅ Todos los servicios ya tienen categoría asignada. Nada que migrar.")
            
    except Exception as e:
        print(f"❌ Error crítico durante la migración: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
