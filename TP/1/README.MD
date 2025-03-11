# Trabajo Práctico 1

* En [este documento](https://cripto.iua.edu.ar/blockchain/doc/) se describen un conjunto de desafíos criptográficos. Resuelva los siguientes:
    * [Búsqueda de una colisión en una función de hash](https://cripto.iua.edu.ar/blockchain/doc/collision.html)
    * [Prueba de trabajo en una red blockchain ficticia](https://cripto.iua.edu.ar/blockchain/doc/blockchain.html)
* Suba el código utilizado a la carpeta `TP/1` de su repositorio personal, tal como se describe en el [README](../README.md) del repositorio de la materia.
* Describa la tarea realizada en el archivo `README.md` de la carpeta `TP/1` de su repositorio personal.


# Búsqueda de una colisión en una función de hash

El script [colisiones_funcion_hash.py](./colisiones_funcion_hash.py) busca dos mensajes distintos que produzcan el mismo hash truncado de SHA-256 en sus primeros `n` bits y los envía a un servidor para verificar la colisión.

## Pasos del proceso

1. **Cálculo del hash SHA-256 truncado**
   - La función `sha256_n(data, n)` calcula el hash SHA-256 de los datos de entrada y devuelve los primeros `n` bits en formato hexadecimal.

2. **Búsqueda de colisión**
   - La función `find_collision(email, n=48)` genera mensajes aleatorios que incluyen el email como prefijo y busca dos mensajes diferentes con el mismo hash truncado.
   - Se utiliza un diccionario (`hash_dict`) para almacenar y comparar hashes, permitiendo detectar colisiones eficientemente.

3. **Envío de la colisión al servidor**
   - La función `send_collision_to_server(email, msg1, msg2)` envía los dos mensajes colisionantes al servidor para su validación.


# Prueba de trabajo en una red blockchain ficticia

El script [prueba_trabajo_red_blockchain.py](./prueba_trabajo_red_blockchain.py) implementa un algoritmo de prueba de trabajo (PoW) para una red blockchain de prueba.

## Pasos del proceso

1. **Obtener el último bloque**

    `get_latest_block(email, server)`: Realiza una solicitud HTTP al servidor para obtener el último bloque de la cadena.

2. **Parsear el bloque**

    `parse_block(block)`: Extrae los datos esenciales del bloque recibido, incluyendo:

    - Número de bloque.
    - Timestamp.
    - Objetivo de dificultad.
    - Hash del bloque anterior.

3. **Crear un nuevo bloque**

    `create_new_block(block_number, target, previous_block_hash, email)`: Genera un nuevo bloque con:

    - Número de bloque incrementado.
    - Hash del bloque anterior.
    - Objetivo de dificultad.
    - Hash del email como identificador del minero.

4. **Minar el bloque**

    `mine_block(new_block, target)`:

    - Itera sobre diferentes valores de nonce y timestamp.
    - Calcula el hash del bloque hasta encontrar uno válido dentro del objetivo de dificultad.
    - Devuelve el bloque minado.

5. **Enviar el bloque minado al servidor**

    `submit_block(new_block, email, server)`: Codifica y envía el bloque minado al servidor.
