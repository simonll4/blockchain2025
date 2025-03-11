"""
Prueba de trabajo para red blockchain de prueba
"""

import requests
import base64
from hashlib import sha256
import time


def get_latest_block(email, server):
    response = requests.get(f"{server}/pow/{email}/blocks/latest", timeout=10)
    if response.status_code == 200:
        return base64.b64decode(response.content)
    else:
        raise requests.exceptions.RequestException(
            f"Error al obtener el último bloque: {response.text}"
        )


def parse_block(block):
    block_number = int.from_bytes(block[:8], "big")
    timestamp = int.from_bytes(block[8:16], "big")
    target_msb = int.from_bytes(block[16:24], "big")
    target = target_msb << 192
    previous_block_hash = sha256(block).digest()
    return block_number, timestamp, target, previous_block_hash


def create_new_block(block_number, target, previous_block_hash, email):
    new_block_number = block_number + 1
    
    block = bytearray(96)
    block[:8] = new_block_number.to_bytes(8, "big")
    block[16:24] = (target >> 192).to_bytes(8, "big")
    block[32:64] = previous_block_hash
    block[64:96] = sha256(email.encode("utf-8")).digest()
    return block


def mine_block(new_block, target):
    nonce = 0
    while True:
        new_timestamp = int(time.time())
        new_block[8:16] = new_timestamp.to_bytes(8, "big")

        new_block[24:32] = nonce.to_bytes(8, "big")
        block_hash = sha256(new_block).digest()
        
        if int.from_bytes(block_hash, "big") <= target:
            print(f"Nonce: {nonce}")
            return new_block
        nonce += 1


def submit_block(new_block, email, server):
    encoded_block = base64.b64encode(new_block)
    
    response = requests.post(
        f"{server}/pow/{email}/blocks", files={"block": encoded_block}, timeout=10
    )
    print("Respuesta del servidor:", response.text)


if __name__ == "__main__":
    
    SERVER = "https://cripto.iua.edu.ar/blockchain"
    EMAIL = "sllamosas806@alumnos.iua.edu.ar"
    
    start_time = time.time()
    
    latest_block = get_latest_block(EMAIL, SERVER)
    block_number, _, target, previous_block_hash = parse_block(latest_block)

    new_block = create_new_block(block_number, target, previous_block_hash, EMAIL)
    mined_block = mine_block(new_block, target)

    submit_block(mined_block, EMAIL, SERVER)

    elapsed_time = time.time() - start_time
    print(f"Tiempo transcurrido en agregar el bloque: {elapsed_time:.2f} segundos")
