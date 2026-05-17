import os
import sys
import io
from app.database import SessionLocal
from app import models
from app.utils.translator import translate_fields

def run_bulk_translation():
    # Asegurar codificación utf-8 para salida en consola
    if sys.platform.startswith('win'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    db = SessionLocal()
    try:
        print("=== INICIANDO TRADUCCIÓN MASIVA DE CATEGORÍAS ===")
        categories = db.query(models.ServiceCategory).all()
        for cat in categories:
            # Si no tiene traducción o está vacío, traducimos
            if not cat.translations or len(cat.translations) == 0:
                print(f"Traduciendo Categoría: '{cat.name}'...")
                to_translate = {}
                if cat.name:
                    to_translate["name"] = cat.name
                if cat.description:
                    to_translate["description"] = cat.description
                
                if to_translate:
                    try:
                        res = translate_fields(to_translate, db)
                        if res:
                            cat.translations = res
                            db.add(cat)
                            db.commit()
                            print(f"  [SUCCESS] Exito: {res}")
                        else:
                            print("  [WARN] La IA devolvió un resultado vacío.")
                    except Exception as e:
                        print(f"  [ERROR] Error al traducir '{cat.name}': {e}")
            else:
                print(f"Categoría '{cat.name}' ya tiene traducciones. Saltando.")

        print("\n=== INICIANDO TRADUCCIÓN MASIVA DE SERVICIOS (TRATAMIENTOS) ===")
        services = db.query(models.Service).all()
        for s in services:
            if not s.translations or len(s.translations) == 0:
                print(f"Traduciendo Servicio: '{s.name}'...")
                to_translate = {}
                if s.name:
                    to_translate["name"] = s.name
                if s.description:
                    to_translate["description"] = s.description
                
                if to_translate:
                    try:
                        res = translate_fields(to_translate, db)
                        if res:
                            s.translations = res
                            db.add(s)
                            db.commit()
                            print(f"  [SUCCESS] Exito: {res}")
                        else:
                            print("  [WARN] La IA devolvió un resultado vacío.")
                    except Exception as e:
                        print(f"  [ERROR] Error al traducir '{s.name}': {e}")
            else:
                print(f"Servicio '{s.name}' ya tiene traducciones. Saltando.")
                
        print("\n=== PROCESO FINALIZADO CON EXITO ===")
    finally:
        db.close()

if __name__ == "__main__":
    run_bulk_translation()
