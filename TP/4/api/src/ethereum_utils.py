import re
import json
import logging
from pathlib import Path

from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware
from eth_account import Account
from eth_account.messages import encode_defunct

# Configurar logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

SIGNATURE_PATTERN = re.compile(r"^0x[a-fA-F0-9]{130}$")
HASH_PATTERN = re.compile(r"0x[0-9a-fA-F]{64}")


def connect_to_node(uri: str) -> Web3:
    """Conecta a un nodo de Ethereum mediante IPC"""
    if not uri:
        raise ValueError("La URI del nodo no puede ser vacía")

    w3 = Web3(Web3.IPCProvider(uri))
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

    if not w3.is_connected():
        logger.error("Error al conectar con el nodo en '%s'", uri)
        raise ConnectionError(f"No se pudo conectar al nodo en {uri}")
    logger.info("Conexión al nodo Ethereum exitosa")
    return w3


def get_local_account(keystore_dir: str, password_file: str) -> tuple:
    """Obtiene la primera cuenta del keystore"""

    keystore_files = sorted(Path(keystore_dir).glob("*"))
    if not keystore_files:
        logger.error("No se encontraron archivos de keystore")
        raise ValueError("No se encontraron archivos de keystore")

    first_keystore = keystore_files[0]

    try:
        with open(password_file, "r") as f:
            password = f.read().strip()

        with open(first_keystore, "r") as keyfile:
            encrypted_key = keyfile.read()
            private_key = Account.decrypt(encrypted_key, password)

        account = Account.from_key(private_key)
        logger.info(f"Cuenta cargada: {account.address}")

        return account.address, private_key.hex()
    except FileNotFoundError:
        logger.error(f"Archivo de contraseña no encontrado: {password_file}")
        raise ValueError(f"Archivo de contraseña no encontrado: {password_file}")
    except ValueError as e:
        if "MAC mismatch" in str(e):
            logger.error("Contraseña incorrecta")
            raise ValueError("Contraseña incorrecta")
        logger.error(f"Error al cargar la cuenta: {e}")
        raise


def build_and_sign_transaction(
    w3, contract, account_address, private_key, hash_value, signature=None
) -> dict:
    """Construye y firma una transacción para registrar un hash en la blockchain"""

    if signature:
        tx = contract.functions.stampSigned(hash_value, signature).build_transaction(
            {
                "from": account_address,
                "gas": 100000,
                "gasPrice": w3.eth.gas_price,
                "nonce": w3.eth.get_transaction_count(account_address),
                "chainId": w3.eth.chain_id,
            }
        )
    else:
        tx = contract.functions.stamp(hash_value).build_transaction(
            {
                "from": account_address,
                "gas": 100000,
                "gasPrice": w3.eth.gas_price,
                "nonce": w3.eth.get_transaction_count(account_address),
                "chainId": w3.eth.chain_id,
            }
        )

    # Calcular gas estimado
    try:
        estimated_gas = w3.eth.estimate_gas(tx)
        tx["gas"] = estimated_gas
    except Exception as e:
        logger.warning(f"Error al estimar gas para la transacción: {e}")
        tx["gas"] = 100000  # defecto si no se puede estimar

    # Firmar la transacción
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    return signed_tx


def load_contract(w3, contract_path, network_id):
    """Carga el contrato desde un archivo JSON"""
    with open(contract_path) as f:
        config = json.load(f)
    contract = w3.eth.contract(
        abi=config["abi"], address=config["networks"][network_id]["address"]
    )
    logger.info(
        f"Contrato cargado con éxito. Dirección del contrato: {contract.address}"
    )
    return contract


def is_valid_format_hash(string: str) -> bool:
    """Valida que el string sea un hash Ethereum con formato correcto."""
    is_valid = bool(re.match(HASH_PATTERN, string))
    return is_valid


def is_valid_format_signature(signature: str) -> bool:
    """Valida que un string sea una firma Ethereum con formato correcto."""
    is_valid = bool(SIGNATURE_PATTERN.fullmatch(signature))
    return is_valid


def is_valid_signature(hash_value: str, signature: str) -> bool:
    """Valida que la firma corresponde al hash proporcionado con el formato correcto."""
    try:
        if not is_valid_format_signature(signature):
            logger.warning(
                f"Firma '{signature}' no es válida para el hash '{hash_value}'"
            )
            return False

        message = encode_defunct(hexstr=hash_value)
        Account.recover_message(message, signature=signature)
        return True
    except Exception as e:
        logger.error(f"Error al validar la firma: {e}")
        return False
