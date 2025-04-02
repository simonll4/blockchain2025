from dotenv import load_dotenv
import os

load_dotenv()

# Número de puerto en el que la API escuchará
PORT = os.getenv("PORT")

# URI del nodo de la blockchain (IPC)
NODE_URI = os.getenv("NODE_URI")

# Ruta al archivo del contrato inteligente
CONTRACT_PATH = os.getenv("CONTRACT_PATH")

# ID de la red de la blockchain
NETWORK_ID = os.getenv("NETWORK_ID")

# Directorio que contiene los archivos de keystore para las cuentas
KEYSTORE_DIR = os.getenv("KEYSTORE_DIR")

# Ruta al archivo que contiene la contraseña para el keystore
PASSWORD_FILE = os.getenv("PASSWORD_FILE")
