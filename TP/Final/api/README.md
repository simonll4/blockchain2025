# Documentación de la API

Esta API está modularizada en los siguientes módulos principales, cada uno con sus propios endpoints y responsabilidades. A continuación, se describen los endpoints agrupados por módulo, junto con los posibles mensajes de error.

## Instalación y ejecución

### 1. Instalar dependencias y ejecutar la API (Node.js)

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Para iniciar la API en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   O para producción (requiere build previo):
   ```bash
   npm run build
   npm run start:prod
   ```

### 2. Pruebas automáticas (directorio `/test`)

Las pruebas automáticas están escritas en Python y se encuentran en la carpeta `/test`.

1. Crea un entorno virtual con Python 3.10:
   ```bash
   cd test
   python3.10 -m venv .venv
   source .venv/bin/activate
   ```
2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Ejecuta los tests:
   ```bash
   pytest test_apiserver.py
   ```

Asegúrate de que la API esté corriendo antes de ejecutar los tests.

---

## Módulo: **Accounts**

### `/register`
- Permite a un usuario registrarse para crear llamados, y los autoriza de inmediato.
- **Método:** `POST`
- **Content-type:** `application/json`
- **Cuerpo:**  
  ```json
  {
    "address": "Dirección del solicitante",
    "signature": "Firma de la dirección del contrato con la clave privada del solicitante"
  }
  ```
  El mensaje a firmar es una secuencia de bytes de longitud 20, procesado por `encode_defunct` de `eth_account.messages` (Python).
- **Respuestas:**
  - **200:** `{ "message": "OK" }`
  - **400:**  
    - `INVALID_MIMETYPE`
    - `INVALID_ADDRESS`
    - `INVALID_SIGNATURE`
  - **403:** `ALREADY_AUTHORIZED`
  - **500:** `INTERNAL_ERROR`

---

### `/authorized/:address`
- Verifica si una dirección está autorizada como creadora de llamados.
- **Método:** `GET`
- **Argumento:** `:address` (dirección a consultar)
- **Respuestas:**
  - **200:** `{ "authorized": true | false }`
  - **400:** `INVALID_ADDRESS`
  - **500:** `INTERNAL_ERROR`

---

### `/creators`
- Retorna todas las direcciones autorizadas como creadoras de llamados.
- **Método:** `GET`
- **Respuestas:**
  - **200:** `{ "creators": [ "address1", "address2", ... ] }`
  - **500:** `INTERNAL_ERROR`

---

### `/pendings`
- Retorna todas las direcciones pendientes de autorización como creadoras.
- **Método:** `GET`
- **Respuestas:**
  - **200:** `{ "pending": [ "address1", "address2", ... ] }`
  - **500:** `INTERNAL_ERROR`

---

## Módulo: **Calls**

### `/create`
- Crea un llamado a presentación de propuestas utilizando la función correspondiente de `CFPFactory`.
- **Método:** `POST`
- **Content-type:** `application/json`
- **Cuerpo:**  
  ```json
  {
    "callId": "Hash identificador",
    "closingTime": "ISO 8601",
    "signature": "Firma de la dirección del contrato + callId"
  }
  ```
  El mensaje a firmar es una secuencia de bytes de longitud 52 (20 bytes de dirección + 32 bytes de callId), procesado por `encode_defunct` de `eth_account.messages` (Python).
- **Respuestas:**
  - **201:** `{ "message": "OK" }`
  - **400:**  
    - `INVALID_MIMETYPE`
    - `INVALID_CALLID`
    - `INVALID_TIME_FORMAT`
    - `INVALID_CLOSING_TIME`
    - `INVALID_SIGNATURE`
  - **403:**  
    - `ALREADY_CREATED`
    - `UNAUTHORIZED`
  - **500:** `INTERNAL_ERROR`

---

### `/calls`
- Retorna todos los llamados creados.
- **Método:** `GET`
- **Respuestas:**
  - **200:**  
    ```json
    [
      {
        "creator": "Dirección",
        "cfp": "Dirección del contrato",
        "closingTime": "ISO 8601"
      },
      ...
    ]
    ```
  - **500:** `{ "message": "INTERNAL_ERROR" }`

---

### `/calls/:call_id`
- Obtiene información de un llamado específico.
- **Método:** `GET`
- **Argumento:** `:call_id` (hash identificador)
- **Respuestas:**
  - **200:**  
    ```json
    {
      "creator": "Dirección",
      "cfp": "Dirección del contrato"
    }
    ```
  - **400:** `INVALID_CALLID`
  - **404:** `CALLID_NOT_FOUND`
  - **500:** `INTERNAL_ERROR`

---

### `/closing-time/:call_id`
- Obtiene la fecha y hora de cierre de un llamado.
- **Método:** `GET`
- **Argumento:** `:call_id` (hash identificador)
- **Respuestas:**
  - **200:** `{ "closingTime": "ISO 8601" }`
  - **400:** `INVALID_CALLID`
  - **404:** `CALLID_NOT_FOUND`
  - **500:** `INTERNAL_ERROR`

---

## Módulo: **Proposals**

### `/register-proposal`
- Permite a un usuario registrar una propuesta en un determinado llamado.
- **Método:** `POST`
- **Content-type:** `application/json`
- **Cuerpo:**  
  ```json
  {
    "callId": "Hash identificador del llamado",
    "proposal": "Hash identificador de la propuesta"
  }
  ```
- **Respuestas:**
  - **201:** `{ "message": "OK" }`
  - **400:**  
    - `INVALID_MIMETYPE`
    - `INVALID_CALLID`
    - `INVALID_PROPOSAL`
  - **403:** `ALREADY_REGISTERED`
  - **404:** `CALLID_NOT_FOUND`
  - **500:** `INTERNAL_ERROR`

---

### `/proposal-data/:call_id/:proposal`
- Obtiene los datos de una propuesta registrada.
- **Método:** `GET`
- **Argumentos:**  
  - `:call_id` (hash del llamado)
  - `:proposal` (hash de la propuesta)
- **Respuestas:**
  - **200:**  
    ```json
    {
      "sender": "Dirección",
      "blockNumber": 12345,
      "timestamp": "ISO 8601"
    }
    ```
  - **400:**  
    - `INVALID_CALLID`
    - `INVALID_PROPOSAL`
  - **404:**  
    - `CALLID_NOT_FOUND`
    - `PROPOSAL_NOT_FOUND`
  - **500:** `INTERNAL_ERROR`

---

## Módulo: **Contracts**

### `/contract-address`
- Obtiene la dirección del contrato factoría.
- **Método:** `GET`
- **Respuestas:**
  - **200:** `{ "address": "Dirección del contrato" }`

---

### `/contract-owner`
- Obtiene la dirección del dueño del contrato factoría.
- **Método:** `GET`
- **Respuestas:**
  - **200:** `{ "address": "Dirección del dueño" }`

---

## Módulo: **Health**

### `/health`
- Endpoint de salud para verificar el estado de la API.
- **Método:** `GET`
- **Respuestas:**
  - **200:**

---

## Mensajes de error

| ID                   | Mensaje                               |
| -------------------- | ------------------------------------- |
| INVALID_ADDRESS      | "Dirección inválida"                  |
| INVALID_SIGNATURE    | "Firma inválida"                      |
| INVALID_MIMETYPE     | "Tipo MIME inválido"                  |
| INVALID_CALLID       | "Identificador de llamado incorrecto" |
| INVALID_PROPOSAL     | "Formato de propuesta incorrecto"     |
| INVALID_TIME_FORMAT  | "Formato de tiempo incorrecto"        |
| INVALID_CLOSING_TIME | "Tiempo de cierre inválido"           |
| ALREADY_AUTHORIZED   | "Ya está autorizado"                  |
| ALREADY_CREATED      | "El llamado ya existe"                |
| ALREADY_REGISTERED   | "La propuesta ya ha sido registrada"  |
| CALLID_NOT_FOUND     | "El llamado no existe"                |
| PROPOSAL_NOT_FOUND   | "La propuesta no existe"              |
| UNAUTHORIZED         | "No autorizado"                       |
| INTERNAL_ERROR       | "Error interno"                       |
| OK                   | "OK"                                  |
