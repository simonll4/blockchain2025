# CFP API

Esta API permite gestionar llamados a propuestas, registrar participantes, enviar propuestas, y consultar información relacionada.

## Requisitos

- Python 3.8+
- Ganache (modo blockchain local)
- Node.js (para compilar contratos con Truffle)
- Instalar dependencias:

```bash
pip install -r requirements.txt

```

## Estructura del Proyecto

```
src
  ├── app.py                     # API principal
  ├── config/
  │   └── config.json            # Configuración
  ├── utils/
  │   ├── config_loader.py
  │   ├── web3_utils.py
  │   └── helpers.py
  ├── messages.py                # Diccionario de mensajes de error

```

## Configuración

Asegurarse de configurar `src/config/config.json`:

```json
{
  "mnemonic": "tu frase mnemónica",
  "account_index": 0,
  "network_id": "5777",
  "ganache_url": "http://127.0.0.1:8545",
  "hd_path_template": "ruta HD usada para derivar direcciones",
  "factory_contract_path": "ruta al archivo JSON del contrato CFPFactory compilado",
  "cfp_contract_path": "ruta al archivo JSON del contrato CFP compilado"
}
```
## Compilación y Despliegue de Contratos

Antes de iniciar el backend, asegúrate de compilar y migrar los contratos a la red ganache en `TP/7`:

```bash
truffle compile
truffle migrate
```

## Ejecutar la API

Inicia Ganache y luego ejecuta la API con:

```bash
python app.py
```

## Endpoints Principales

### Crear Llamado

**Método:** `POST`  
**URL:** `/create`  
Crea un nuevo llamado a propuestas.

**Body (JSON):**

```json
{
  "callId": "0x123abc...",
  "closingTime": "2025-12-31T23:59:59Z",
  "signature": "0x456def..."
}
```

---

### Registrar Propuesta

**Método:** `POST`  
**URL:** `/register-proposal`  
Asocia una propuesta a un llamado existente.

**Body (JSON):**

```json
{
  "callId": "0x123abc...",
  "proposal": "0x789ghi..."
}
```

---

### Registrar Dirección

**Método:** `POST`  
**URL:** `/register`  
Registra y Autoriza una dirección para participar en los llamados.

**Body (JSON):**

```json
{
  "address": "0xabc123...",
  "signature": "0xdef456..."
}
```

---

## Consultas GET

### Obtener datos de un llamado

**URL:** `/calls/<callId>`  
**Respuesta:**  
Devuelve el creador del llamado y el contrato CFP asociado.

---

### Obtener fecha de cierre

**URL:** `/closing-time/<callId>`  
**Respuesta:**  
Retorna la fecha de cierre del llamado en formato ISO 8601.

---

### Obtener todos los llamados

**URL:** `/calls`  
**Método:** `GET`  
**Descripción:**  
Devuelve un array de objetos, cada uno con:

- `callId`: ID del llamado
- `creator`: dirección del creador del llamado
- `cfpAddress`: dirección del contrato CFP asociado

### Obtener datos de una propuesta

**URL:** `/proposal-data/<callId>/<proposal>`
**Respuesta:**
Devuelve los datos de una propuesta específica dentro de un llamado.

---

### Dirección del contrato Factory

**URL:** `/contract-address`
**Respuesta:**
Retorna la dirección del contrato Factory desplegado en blockchain.

---

### Dirección del owner del contrato

**URL:** `/contract-owner`
**Respuesta:**
Retorna la dirección del propietario del contrato.

---

### Verificar autorización de una dirección

**URL:** `/authorized/<address>`
**Respuesta:**
Devuelve `true` o `false` dependiendo de si la dirección está autorizada.

---

## Notas

- Los IDs (`callId`, `proposal`, `address`) deben estar en formato hexadecimal (`0x...`).

```

```
