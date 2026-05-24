from .landing import update_landing_config
from .services import (
    update_service_fields, 
    create_new_service, 
    move_service_to_category, 
    get_uncategorized_services_and_categories,
    list_all_services
)
from .categories import (
    create_new_category,
    list_all_categories,
    list_services_in_category
)
from .appointments import get_daily_appointments

# Lista de herramientas unificada disponible para Gemini
AGENT_TOOLS = [
    update_landing_config, 
    update_service_fields, 
    get_daily_appointments, 
    create_new_service, 
    move_service_to_category, 
    get_uncategorized_services_and_categories,
    create_new_category,
    list_all_categories,
    list_services_in_category,
    list_all_services
]
