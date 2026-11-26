from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import json
import io
import uuid
import re
import openpyxl
from .. import schemas, database, models
from ..crud import services as crud
from ..utils.excel_importer import extract_excel_headers_and_preview, format_cell_value
import os
from supabase import create_client, Client

from ..limits import check_service_limit

router = APIRouter(
    prefix="/services",
    tags=["services"],
)

@router.post("/import-excel-preview")
async def preview_services_excel(file: UploadFile = File(...)):
    try:
        content = await file.read()
        headers, preview = extract_excel_headers_and_preview(content, max_preview_rows=5)
        return {"headers": headers, "preview": preview}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer el archivo Excel: {str(e)}")

@router.post("/import-excel")
async def import_services_excel(
    file: UploadFile = File(...),
    mapping: str = Form(...),
    visibility_mode: str = Form("auto"),
    stock_control_mode: str = Form("auto"),
    stream: bool = Form(False),
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context required")

    try:
        mapping_dict = json.loads(mapping)
    except Exception:
        raise HTTPException(status_code=400, detail="Mapeo inválido (se esperaba JSON)")

    content = await file.read()
    wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
    ws = wb.active

    # Detect header row
    headers = []
    header_row_idx = 1
    for r in range(1, min(10, ws.max_row + 1)):
        row_vals = [ws.cell(r, c).value for c in range(1, ws.max_column + 1)]
        non_empty = [v for v in row_vals if v is not None and str(v).strip()]
        if len(non_empty) >= 2:
            headers = [str(v).strip() if v is not None else f"Col_{c}" for c, v in enumerate(row_vals, 1)]
            header_row_idx = r
            break

    col_index_map = {h: i + 1 for i, h in enumerate(headers)}

    def get_val(row_idx, field_key):
        mapped_col = mapping_dict.get(field_key)
        if not mapped_col or mapped_col not in col_index_map:
            return None
        c = col_index_map[mapped_col]
        return ws.cell(row_idx, c).value

    def parse_float(val, default=None):
        if val is None or str(val).strip() == "":
            return default
        try:
            return float(str(val).replace(",", ".").strip())
        except ValueError:
            return default

    def parse_int(val, default=None):
        f = parse_float(val, None)
        return int(f) if f is not None else default

    def parse_str(val):
        if val is None:
            return None
        s = str(val).strip()
        if s.endswith(".0") and s[:-2].isdigit():
            s = s[:-2]
        return s or None

    # Cache categories & services in memory for fast bulk upsert
    existing_categories = {
        c.name.strip().lower(): c for c in db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id
        ).all()
    }
    existing_by_sku = {}
    existing_by_name = {}
    for s_obj in db.query(models.Service).filter(models.Service.tenant_id == tenant_id).all():
        if s_obj.sku:
            existing_by_sku[s_obj.sku.strip().lower()] = s_obj
        if s_obj.name:
            existing_by_name[s_obj.name.strip().lower()] = s_obj

    total_rows = max(0, ws.max_row - header_row_idx)

    def run_import_generator():
        imported = 0
        updated = 0
        skipped = 0
        errors = []
        processed = 0

        if stream:
            yield json.dumps({"type": "start", "total_rows": total_rows}) + "\n"

        for r in range(header_row_idx + 1, ws.max_row + 1):
            processed += 1
            current_name = ""
            try:
                name_val = get_val(r, "name")
                if not name_val or not str(name_val).strip():
                    skipped += 1
                else:
                    name_str = str(name_val).strip()
                    current_name = name_str

                    price_val = parse_float(get_val(r, "price"), 0.0) or 0.0
                    cost_val = parse_float(get_val(r, "cost_price"), None)
                    cost_discount_val = parse_float(get_val(r, "cost_discount"), None)

                    raw_is_prod = get_val(r, "is_product")
                    is_product_val = False
                    if raw_is_prod is not None:
                        s_prod = str(raw_is_prod).strip().lower()
                        if s_prod in ["si", "sí", "yes", "true", "1", "articulo", "artículo", "producto"]:
                            is_product_val = True

                    supplier_val = parse_str(get_val(r, "supplier"))
                    supplier_code_val = parse_str(get_val(r, "supplier_code"))
                    sku_val = parse_str(get_val(r, "sku")) or supplier_code_val
                    stock_val = parse_int(get_val(r, "stock"), None)
                    min_stock_val = parse_int(get_val(r, "min_stock"), None)
                    stock_unit_val = parse_str(get_val(r, "stock_unit")) or "uds"
                    unit_content_val = parse_float(get_val(r, "unit_content"), None)
                    ticket_name_val = parse_str(get_val(r, "ticket_name"))
                    description_val = parse_str(get_val(r, "description"))

                    def parse_opt_bool(raw_v):
                        if raw_v is None or str(raw_v).strip() == "":
                            return None
                        sv = str(raw_v).strip().lower()
                        if sv in ["si", "sí", "yes", "true", "1", "activo", "activado"]:
                            return True
                        if sv in ["no", "false", "0", "inactivo", "desactivado"]:
                            return False
                        return None

                    col_visible_web = parse_opt_bool(get_val(r, "is_visible_on_web"))
                    col_visible_pos = parse_opt_bool(get_val(r, "is_visible_on_pos"))
                    col_track_stock = parse_opt_bool(get_val(r, "track_stock"))

                    # Estado activo/desactivado
                    raw_status = get_val(r, "status")
                    is_active_val = True
                    if raw_status is not None:
                        st = str(raw_status).strip().lower()
                        if st in ["desactivado", "inactivo", "inactive", "no", "0", "false", "baja"]:
                            is_active_val = False

                    # Duración inteligente: Duración + Exposición (si Duración=0, usa Exposición)
                    dur_base = parse_int(get_val(r, "duration"), 0) or 0
                    exp_val = parse_int(get_val(r, "exposure"), 0) or 0
                    combined_dur = dur_base + exp_val
                    if combined_dur > 0:
                        duration_val = combined_dur
                    else:
                        duration_val = 0 if is_product_val else 30

                    # Categoría inteligente: si es genérica "PRODUCTOS SIN FAMILIA", usar Proveedor si viene
                    raw_cat = parse_str(get_val(r, "category"))
                    if raw_cat and raw_cat.lower() in ["productos sin familia", "sin familia"] and supplier_val:
                        raw_cat = supplier_val

                    category_id = None
                    if raw_cat:
                        cat_key = raw_cat.lower()
                        if cat_key in existing_categories:
                            category_id = existing_categories[cat_key].id
                        else:
                            new_cat = models.ServiceCategory(
                                id=str(uuid.uuid4()),
                                tenant_id=tenant_id,
                                name=raw_cat,
                                slug=re.sub(r"[^a-z0-9]+", "-", cat_key).strip("-") or "cat"
                            )
                            db.add(new_cat)
                            db.flush()
                            existing_categories[cat_key] = new_cat
                            category_id = new_cat.id

                    if visibility_mode == "tpv_only":
                        is_visible_web = False
                        is_visible_pos = True
                    elif visibility_mode == "web_only":
                        is_visible_web = True
                        is_visible_pos = False
                    elif visibility_mode == "web_and_tpv":
                        is_visible_web = True
                        is_visible_pos = True
                    else:
                        is_visible_web = col_visible_web if col_visible_web is not None else (False if is_product_val else True)
                        is_visible_pos = col_visible_pos if col_visible_pos is not None else True

                    if stock_control_mode == "disabled":
                        track_stock_val = False
                    elif stock_control_mode == "enabled":
                        track_stock_val = bool(is_product_val)
                    else:
                        if col_track_stock is not None:
                            track_stock_val = bool(is_product_val and col_track_stock)
                        else:
                            track_stock_val = bool(is_product_val and (stock_val is not None or min_stock_val is not None))

                    existing = None
                    if sku_val and sku_val.lower() in existing_by_sku:
                        existing = existing_by_sku[sku_val.lower()]
                    elif name_str.lower() in existing_by_name:
                        existing = existing_by_name[name_str.lower()]

                    if existing:
                        existing.price = price_val
                        if cost_val is not None:
                            existing.cost_price = cost_val
                        if cost_discount_val is not None:
                            existing.cost_discount = cost_discount_val
                        existing.is_product = is_product_val
                        existing.is_visible_on_web = is_visible_web
                        existing.is_visible_on_pos = is_visible_pos
                        if stock_control_mode in ("enabled", "disabled") or track_stock_val:
                            existing.track_stock = track_stock_val
                        existing.is_active = is_active_val
                        if sku_val:
                            existing.sku = sku_val
                        if stock_val is not None:
                            existing.stock = stock_val
                        if min_stock_val is not None:
                            existing.min_stock = min_stock_val
                        if stock_unit_val:
                            existing.stock_unit = stock_unit_val
                        if unit_content_val is not None:
                            existing.unit_content = unit_content_val
                        if supplier_val:
                            existing.supplier = supplier_val
                        if supplier_code_val:
                            existing.supplier_code = supplier_code_val
                        if ticket_name_val:
                            existing.ticket_name = ticket_name_val
                        if description_val:
                            existing.description = description_val
                        if category_id:
                            existing.category_id = category_id
                        if duration_val > 0:
                            existing.duration_minutes = duration_val
                        updated += 1
                    else:
                        base_slug = re.sub(r"[^a-z0-9]+", "-", name_str.lower()).strip("-") or "item"
                        unique_slug = f"{base_slug[:40]}-{str(uuid.uuid4())[:6]}"

                        new_service = models.Service(
                            id=str(uuid.uuid4()),
                            tenant_id=tenant_id,
                            name=name_str,
                            slug=unique_slug,
                            description=description_val,
                            price=price_val,
                            cost_price=cost_val,
                            cost_discount=cost_discount_val,
                            is_product=is_product_val,
                            is_visible_on_web=is_visible_web,
                            is_visible_on_pos=is_visible_pos,
                            track_stock=track_stock_val,
                            sku=sku_val,
                            stock=stock_val,
                            min_stock=min_stock_val,
                            stock_unit=stock_unit_val,
                            unit_content=unit_content_val,
                            supplier=supplier_val,
                            supplier_code=supplier_code_val,
                            ticket_name=ticket_name_val,
                            duration_minutes=duration_val,
                            category_id=category_id,
                            is_active=is_active_val
                        )
                        db.add(new_service)
                        if sku_val:
                            existing_by_sku[sku_val.lower()] = new_service
                        existing_by_name[name_str.lower()] = new_service
                        imported += 1
            except Exception as err:
                errors.append(f"Fila {r}: {str(err)}")

            if stream and (processed % 10 == 0 or processed == total_rows):
                yield json.dumps({
                    "type": "progress",
                    "processed": processed,
                    "total_rows": total_rows,
                    "imported": imported,
                    "updated": updated,
                    "skipped": skipped,
                    "current_item": current_name
                }) + "\n"

        db.commit()
        yield json.dumps({
            "type": "complete",
            "status": "ok",
            "total_rows": total_rows,
            "imported": imported,
            "updated": updated,
            "skipped": skipped,
            "errors": errors[:10]
        }) + "\n"

    if stream:
        return StreamingResponse(run_import_generator(), media_type="application/x-ndjson")

    final_payload = {}
    for chunk in run_import_generator():
        final_payload = json.loads(chunk)
    return final_payload

@router.post("/", response_model=schemas.ServiceResponse)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(database.get_db)):
    check_service_limit(db)
    return crud.create_service(db=db, service=service)

@router.get("/", response_model=List[schemas.ServiceResponse])
def read_services(
    skip: int = 0, 
    limit: int = 1000, 
    is_visible_on_web: Optional[bool] = None,
    is_visible_on_pos: Optional[bool] = None,
    is_product: Optional[bool] = None,
    db: Session = Depends(database.get_db)
):
    return crud.get_services(
        db,
        skip=skip,
        limit=limit,
        is_visible_on_web=is_visible_on_web,
        is_visible_on_pos=is_visible_on_pos,
        is_product=is_product,
    )


@router.get("/import-template")
def download_services_import_template():
    """Genera y descarga una plantilla Excel (.xlsx) oficial con ejemplos para importar servicios, tarifas TPV y productos."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Plantilla_Catalogo"

    headers = [
        "Familia",
        "Nombre",
        "Es artículo",
        "Mostrar en Web",
        "Mostrar en TPV",
        "Precio Venta",
        "Duración",
        "Stock actual",
        "Stock mínimo",
        "Controlar Stock",
        "Observaciones",
    ]
    ws.append(headers)

    sample_rows = [
        ["Corte y Peinado", "Corte y Secado Señora", "no", "Sí", "Sí", 17.50, 45, "", "", "No", "Servicio visible en la web y cobrable en TPV"],
        ["Mechas y Balayage", "Balayage y Degradados Naturales", "no", "Sí", "No", 50.50, 90, "", "", "No", "Servicio escaparate Solo Web (oculto en botones rápidos del TPV)"],
        ["SECADOS", "Secado al aire", "no", "No", "Sí", 12.50, 30, "", "", "No", "Tarifa interna Solo TPV (oculta en web pública)"],
        ["PRODUCTOS DE VENTA", "Mascarilla Salerm (venta)", "si", "No", "Sí", 20.00, 0, 10, 2, "Sí", "Producto físico de venta en TPV con control de stock"],
    ]
    for row in sample_rows:
        ws.append(row)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="plantilla-catalogo-probookia.xlsx"'
        },
    )

@router.get("/{service_id}", response_model=schemas.ServiceResponse)
def read_service(service_id: str, db: Session = Depends(database.get_db)):
    db_service = crud.get_service(db, service_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.get("/slug/{slug}", response_model=schemas.ServiceResponse)
def read_service_by_slug(slug: str, db: Session = Depends(database.get_db)):
    db_service = crud.get_service_by_slug(db, slug=slug)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.patch("/{service_id}", response_model=schemas.ServiceResponse)
def update_service(service_id: str, service_update: schemas.ServiceUpdate, db: Session = Depends(database.get_db)):
    db_service = crud.update_service(db, service_id=service_id, service=service_update)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.delete("/{service_id}")
def delete_service(service_id: str, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.tenant_id == tenant_id
    ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    has_appointments = db.query(models.Appointment).filter(models.Appointment.service_id == service_id).first()
    has_vouchers = db.query(models.Voucher).filter(models.Voucher.service_id == service_id).first()
    has_templates = db.query(models.VoucherTemplate).filter(models.VoucherTemplate.service_id == service_id).first()
    
    if has_appointments or has_vouchers or has_templates:
        raise HTTPException(
            status_code=409, 
            detail="No se puede eliminar porque tiene citas o bonos asociados. Apaga el interruptor 'Servicio Activo' para ocultarlo en su lugar."
        )
        
    if service.image_url:
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if supabase_url and supabase_key:
            try:
                supabase: Client = create_client(supabase_url, supabase_key)
                filename = service.image_url.split('/')[-1]
                supabase.storage.from_("media").remove([filename])
            except Exception as e:
                pass
                
    db.delete(service)
    db.commit()
    return {"message": "Servicio eliminado con éxito"}


@router.post("/bulk-delete")
def bulk_delete_services(payload: schemas.BulkActionPayload, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    service_ids = payload.ids
    
    # 1. Obtener los servicios que pertenecen a este tenant
    services = db.query(models.Service).filter(
        models.Service.id.in_(service_ids),
        models.Service.tenant_id == tenant_id
    ).all()
    
    if not services:
        return {"message": "No se encontraron servicios para eliminar"}
        
    actual_ids = [s.id for s in services]
    
    # 2. Comprobar referencias
    has_appointments = db.query(models.Appointment).filter(models.Appointment.service_id.in_(actual_ids)).first()
    has_vouchers = db.query(models.Voucher).filter(models.Voucher.service_id.in_(actual_ids)).first()
    has_templates = db.query(models.VoucherTemplate).filter(models.VoucherTemplate.service_id.in_(actual_ids)).first()
    
    if has_appointments or has_vouchers or has_templates:
        raise HTTPException(
            status_code=409, 
            detail="Uno o varios servicios no pueden eliminarse porque tienen citas o bonos asociados. Por favor, desactiva su interruptor 'Activo' en su lugar."
        )
        
    # 3. Eliminar imágenes de Supabase Storage en bulk si aplica
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if supabase_url and supabase_key:
        try:
            supabase: Client = create_client(supabase_url, supabase_key)
            filenames = []
            for service in services:
                if service.image_url:
                    filename = service.image_url.split('/')[-1]
                    filenames.append(filename)
            if filenames:
                supabase.storage.from_("media").remove(filenames)
        except Exception:
            pass
            
    # 4. Eliminar los servicios
    deleted_count = db.query(models.Service).filter(
        models.Service.id.in_(actual_ids),
        models.Service.tenant_id == tenant_id
    ).delete(synchronize_session=False)
    
    db.commit()
    return {"message": f"{deleted_count} servicios eliminados con éxito"}


@router.post("/bulk-status")
def bulk_status_services(payload: schemas.BulkStatusPayload, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    service_ids = payload.ids
    is_active = payload.is_active
    
    updated_count = db.query(models.Service).filter(
        models.Service.id.in_(service_ids),
        models.Service.tenant_id == tenant_id
    ).update({models.Service.is_active: is_active}, synchronize_session=False)
    
    db.commit()
    return {"message": f"Estado de {updated_count} servicios actualizado con éxito"}


@router.post("/bulk-visibility")
def bulk_visibility_services(payload: schemas.BulkWebVisibilityPayload, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    updates = {}
    if payload.is_visible_on_web is not None:
        updates[models.Service.is_visible_on_web] = payload.is_visible_on_web
    if payload.is_visible_on_pos is not None:
        updates[models.Service.is_visible_on_pos] = payload.is_visible_on_pos

    if not updates:
        return {"message": "Sin cambios de visibilidad"}

    updated_count = db.query(models.Service).filter(
        models.Service.id.in_(payload.ids),
        models.Service.tenant_id == tenant_id
    ).update(updates, synchronize_session=False)

    db.commit()
    return {"message": f"Visibilidad de {updated_count} ítems actualizada con éxito"}


@router.post("/bulk-track-stock")
def bulk_track_stock_services(payload: schemas.BulkTrackStockPayload, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    updated_count = db.query(models.Service).filter(
        models.Service.id.in_(payload.ids),
        models.Service.tenant_id == tenant_id,
        models.Service.is_product == True
    ).update({models.Service.track_stock: payload.track_stock}, synchronize_session=False)

    db.commit()
    return {"message": f"Control de stock de {updated_count} productos actualizado con éxito"}


@router.post("/export-to-media")
def export_services_to_media(db: Session = Depends(database.get_db)):
    """Exports the current tenant's services to a CSV file and saves it in their Media Gallery."""
    import csv
    import io
    import uuid
    import datetime
    
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context required")
        
    # Check plan limit for exporting/generating documents
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    plan = (tenant.plan_type or "free").lower() if tenant else "free"
    
    # Check BYOK (own API keys) in settings
    has_own_key = False
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    if settings and (settings.gemini_api_key or settings.openai_api_key):
        has_own_key = True
        
    if not (plan in ["pro", "gold"] or has_own_key):
        raise HTTPException(
            status_code=403, 
            detail="La exportación de servicios a la galería está reservada para los planes Pro y Gold. Por favor, actualice su plan."
        )

    # Get all services for current tenant
    services = db.query(models.Service).filter(models.Service.tenant_id == tenant_id).all()
    
    # Generate CSV in memory
    output = io.StringIO()
    # Add BOM for Excel compatibility in Spanish/European locales
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    # Header
    writer.writerow([
        "ID", "Nombre", "Categoría", "Descripción", "Duración (min)", 
        "Precio (€)", "Activo", "Destacado", "URL Imagen", "URL Vídeo",
        "Modo de Atención", "Requiere Depósito", "Monto Depósito"
    ])
    
    for s in services:
        category_name = s.category.name if s.category else ""
        writer.writerow([
            s.id,
            s.name,
            category_name,
            s.description or "",
            s.duration_minutes,
            s.price,
            "Sí" if s.is_active else "No",
            "Sí" if s.is_featured else "No",
            s.image_url or "",
            s.video_url or "",
            s.allowed_modality,
            "Sí" if s.requires_deposit else "No",
            s.deposit_amount or 0.00
        ])
        
    csv_content = output.getvalue()
    csv_bytes = csv_content.encode('utf-8-sig')
    
    # Upload to Supabase Storage in bucket 'media'
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")
        
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        # Create a safe, unique filename
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"servicios_{timestamp}_{uuid.uuid4().hex[:6]}.csv"
        
        # Upload
        supabase.storage.from_("media").upload(
            file=csv_bytes,
            path=filename,
            file_options={"content-type": "text/csv", "upsert": "true"}
        )
        
        # Get public url
        public_url = supabase.storage.from_("media").get_public_url(filename)
        
        # Register in models.Media
        new_media = models.Media(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            filename=filename,
            url=public_url,
            file_type="document",
            mime_type="text/csv",
            size=len(csv_bytes)
        )
        db.add(new_media)
        db.commit()
        
        return {
            "success": True,
            "filename": filename,
            "url": public_url,
            "message": "Los servicios han sido exportados correctamente y guardados en la Galería de Medios."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al exportar servicios: {str(e)}")
