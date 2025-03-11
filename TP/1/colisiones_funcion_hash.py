""" "
Encuentra dos mensajes distintos que colisionen en SHA-256-n y
los envía al servidor para verificar la colision.
"""

import hashlib
import os
import time
import requests


def sha256_n(data, n):
    """Calcula el hash SHA-256 y toma los primeros n bits."""

    hash_full = hashlib.sha256(data).hexdigest()
    return hash_full[: n // 4]


def find_collision(email, n=48):
    """Encuentra dos mensajes distintos que colisionen en SHA-256-n."""

    hash_dict = {}
    while True:
        random_suffix = os.urandom(8).hex()  # sufijo de 16 caracteres (unico)
        message = f"{email}{random_suffix}".encode("utf-8")
        hash_value = sha256_n(message, n)

        # Verifica si ya hemos visto este hash antes
        if hash_value in hash_dict:
            return hash_dict[hash_value], message
        else:
            hash_dict[hash_value] = message


def send_collision_to_server(email, msg1, msg2):
    """Envía la colisión al servidor."""

    SERVER = "https://cripto.iua.edu.ar/blockchain"
    response = requests.post(
        f"{SERVER}/collision/{email}/answer",
        files={"message1": msg1, "message2": msg2},
        timeout=10,
    )
    return response.status_code, response.text


if __name__ == "__main__":
    start_time = time.time()

    EMAIL = "sllamosas806@alumnos.iua.edu.ar"
    
    message1, message2 = find_collision(EMAIL)

    elapsed_time = time.time() - start_time

    print(f"Mensaje 1: {message1.decode('utf-8')}")
    print(f"Mensaje 2: {message2.decode('utf-8')}")

    status_code, response_text = send_collision_to_server(EMAIL, message1, message2)

    print(f"Status Code: {status_code}")
    print(f"Response: {response_text}")
    print(f"Tiempo de ejecución: {elapsed_time:.2f} segundos")
