# Documentación de la API

---
## Configuración de la API

Antes de ejecutar la API, es necesario configurar manualmente el archivo de configuración `src/config/config.json` y asegurarse que el archivo `src/config/contractsConfig.json` tenga la informacion correcta del despligue de los contratos:

### 1. `config.json`

Este archivo contiene la configuración de la cuenta que utilizará la API para interactuar con la blockchain. Editar con los datos correspondientes a tu entorno:

```json
{
  "ganache_url": "http://127.0.0.1:7545",           // URL del nodo Ethereum (por ejemplo, Ganache, Infura, etc.)
  "mnemonic": "<frase mnemotécnica>",               // Frase mnemotécnica de la wallet a utilizar
  "account_index": 0,                                // Índice de la cuenta a usar del HD wallet
  "hd_path_template": "m/44'/60'/0'/0/{index}"      // Ruta HD para derivar cuentas
}
```

### 2. `contractsConfig.json`

Este archivo contiene la información de la red y las direcciones de los contratos desplegados que utiliza la API:

```json
{
  "network": {
    "chainId": 1337
  },
  "contracts": {
    "ensRegistry": "<dirección ENSRegistry>",
    "fifsRegistrar": "<dirección FIFSRegistrar>",
    "usuariosRegistrar": "<dirección UsuariosRegistrar>",
    "llamadosRegistrar": "<dirección LlamadosRegistrar>",
    "reverseRegistrar": "<dirección ReverseRegistrar>",
    "publicResolver": "<dirección PublicResolver>",
    "cfpFactory": "<dirección CFPFactory>"
  },
  "domains": {
    "tld": "cfp",
    "usuarios": "usuarios.cfp",
    "llamados": "llamados.cfp",
    "reverse": "addr.reverse"
  },
  "timestamp": "<fecha de despliegue>"
}
```

---

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

---

## Módulo: **Accounts**
Esta API está modularizada en los siguientes módulos principales, cada uno con sus propios endpoints y responsabilidades. A continuación, se describen los endpoints agrupados por módulo, junto con los posibles mensajes de error.

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

- Retorna todas las direcciones autorizadas como creadoras de llamados. Si una dirección tiene un nombre ENS registrado, se devuelve el nombre en vez de la dirección.
- **Método:** `GET`
- **Respuestas:**
  - **200:** `{ "creators": [ "address1", "address2", ... ] }`
  - **500:** `INTERNAL_ERROR`

---

### `/pendings`

- Retorna todas las direcciones pendientes de autorización como creadoras. Si una dirección tiene un nombre ENS registrado, se devuelve el nombre en vez de la dirección.
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
        "creator": "Dirección o nombre ENS del creador",
        "cfp": "Dirección o nombre ENS del contrato",
        "closingTime": "ISO 8601",
        "description":"Descripcion del llamado"
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
      "creator": "Dirección o nombre ENS del creador",
      "cfp": "Dirección o nombre ENS del contrato",
      "description": "Descripcion del llamado"
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
