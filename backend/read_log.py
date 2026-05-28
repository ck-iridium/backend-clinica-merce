import os

log_path = "c:\\Users\\Juan\\MERCE\\CLINICA MERCE\\backend\\ai_generation.log"
if os.path.exists(log_path):
    print("Últimas 50 líneas de ai_generation.log:")
    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
        for line in lines[-50:]:
            print(line.strip())
else:
    print("El archivo ai_generation.log no existe.")
