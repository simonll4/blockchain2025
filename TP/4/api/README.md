# API REST para Interacción con el Contrato Stamped

Este proyecto implementa una API REST para interactuar con el contrato inteligente **Stamped**, desplegado en la red de prueba de la BFA en la dirección `0xA2e82b0666a291c53F374E34A6C09fBA873aB0f2`. El contrato permite registrar sellos de tiempo para hashes y consultar su estado.

## 📌 Funcionalidades del Contrato

El contrato proporciona las siguientes funciones:

- `stamp(bytes32 hash)`: Registra un hash con la dirección del remitente y el número de bloque. Si el hash ya existe, la transacción se revierte.
- `stampSigned(bytes32 hash, bytes signature)`: Registra un hash con una firma proporcionada. Si el hash ya existe, la transacción se revierte.
- `stamped(bytes32 hash)`: Consulta la información de un hash registrado, devolviendo la dirección del firmante y el número de bloque.

## 🚀 Endpoints de la API

### Obtener información de un hash registrado

**Endpoint:** `/stamped/:hash`

- **Método:** `GET`
- **Parámetro:** `:hash` (hash de 256 bits en formato hexadecimal)
- **Respuesta Exitosa:**
  - Código HTTP: `200`
  - Cuerpo:
    ```json
    {
      "signer": "0x...",
      "blockNumber": 123456
    }
    ```
- **Errores:**
  - `404 Not Found`: El hash no está registrado.
  - `400 Bad Request`: Formato de hash inválido.

### Registrar un hash en la blockchain

**Endpoint:** `/stamp`

- **Método:** `POST`
- **Content-Type:** `application/json`
- **Cuerpo:**
  ```json
  {
    "hash": "0x...",
    "signature": "0x..." // Opcional
  }
  ```
- **Respuesta Exitosa:**
  - Código HTTP: `201`
  - Cuerpo:
    ```json
    {
      "transaction": "0x...",
      "blockNumber": 123456
    }
    ```
- **Errores:**
  - `403 Forbidden`: El hash ya ha sido registrado.
  - `400 Bad Request`: Formato de hash/firma inválido o content-type incorrecto.
  - `500 Internal Server Error`: Error en la transacción.

## ⚙️ Configuración del Entorno

Antes de ejecutar la API, debes definir las variables de entorno en un archivo `.env`. Un archivo de ejemplo se proporciona como `.env-ex`, el cual debes renombrar a `.env` y completar con los valores adecuados:

```bash
mv .env-ex .env
```

Las variables necesarias incluyen:

```plaintext
PORT=5000
NODE_URI="/ruta/al/nodo.ipc"
CONTRACT_PATH="./Stamper.json"
NETWORK_ID="1"
KEYSTORE_DIR="/ruta/a/keystore"
PASSWORD_FILE="/ruta/a/password.txt"
```

## ▶️ Ejecución

1. Instalar dependencias propias de la api (requerimets.txt del proyecto):
   ```bash
   pip install -r requirements.txt
   ```
2. Ejecutar la API:
   ```bash
   python app.py
   ```

## 🧪 Pruebas con Pytest

El proyecto incluye un conjunto de pruebas automatizadas utilizando `pytest` para verificar el correcto funcionamiento de la API.

### 📌 Casos de Prueba

- **test_invalid_mimetype**: Verifica que el servidor rechace solicitudes con `Content-Type` inválido.
- **test_stamped_invalid_hash**: Prueba que el servidor rechace hashes con formato incorrecto.
- **test_stamped_unstamped_hash**: Verifica la respuesta para hashes no registrados (`404`).
- **test_stamped_known_hash**: Prueba la consulta de hashes previamente registrados.
- **test_stamp**: Prueba el endpoint `POST /stamp` sin firma.
- **test_stamp_signed**: Prueba el endpoint `POST /stamp` con firma digital.
- **test_invalid_signature**: Verifica el manejo de firmas inválidas.

### ▶️ Ejecutar las Pruebas

Para ejecutar las pruebas, asegúrate de tener `pytest` instalado y luego ejecuta:

```bash
pytest


## 📄 Estructura del Proyecto

```

/api
├── python/ # Directorio para código en Python
├── src/ # Código fuente de la API
├── test/ # Pruebas del proyecto
├── .env-ex # Archivo de ejemplo para variables de entorno
├── README.md # Documentación del proyecto
└── requirements.txt # Dependencias del proyecto

```

```
