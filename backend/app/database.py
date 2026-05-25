import os
import contextvars
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv(override=True)

# Usar SQLite por defecto para desarrollo local si no se define DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clinica_v2.db")

# Ajuste necesario para SQLite en SQLAlchemy (check_same_thread)
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

# Configuración del pool de conexiones para evitar agotamiento en alta concurrencia
engine_args = {"connect_args": connect_args}
if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_args.update({
        "pool_size": 5,
        "max_overflow": 5,
        "pool_recycle": 1800,
        "pool_pre_ping": True
    })

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# ContextVar para almacenar el tenant_id de la petición actual de forma aislada
current_tenant_var = contextvars.ContextVar("current_tenant_id", default=None)

# Listener de evento para inyectar SET LOCAL app.current_tenant_id al inicio de cada transacción
@event.listens_for(SessionLocal, "after_begin")
def set_tenant_id_in_session(session, transaction, connection):
    tenant_id = current_tenant_var.get()
    if tenant_id:
        # SET LOCAL solo aplica para PostgreSQL, no para SQLite local
        if not connection.engine.url.drivername.startswith("sqlite"):
            connection.execute(
                text("SET LOCAL app.current_tenant_id = :tenant_id"),
                {"tenant_id": tenant_id}
            )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
