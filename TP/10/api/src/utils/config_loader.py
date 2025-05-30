import json


def load_config(path="config/config.json"):
    """Carga el archivo de configuración JSON."""
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"Archivo de configuración no encontrado en: {path}")
