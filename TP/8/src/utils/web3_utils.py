from web3 import Web3, Account
from eth_account.messages import encode_defunct
import json
from flask import jsonify

from .config_loader import load_config
from .helpers import validate_eth_signature_format
from messages import MESSAGES

Account.enable_unaudited_hdwallet_features()

config = load_config()
ganache_url = config.get("ganache_url")
w3 = Web3(Web3.HTTPProvider(ganache_url))

if not w3.is_connected():
    raise ConnectionError(f"No se pudo conectar al nodo Ethereum en {ganache_url}")


def get_account(mnemonic, index):
    path = f"m/44'/60'/0'/0/{index}"
    return Account.from_mnemonic(mnemonic, account_path=path)


def load_contract(w3, path):
    with open(path) as f:
        contract_data = json.load(f)
    abi = contract_data["abi"]
    address = Web3.to_checksum_address(contract_data["networks"]["5777"]["address"])
    return w3.eth.contract(address=address, abi=abi)


def load_dynamic_contract(w3, contract_address, CFP_ABI):
    """Carga un contrato usando el ABI del contrato CFP"""
    return w3.eth.contract(address=contract_address, abi=CFP_ABI)


def validate_address(address, error_key="INVALID_ADDRESS"):
    if not Web3.is_address(address):
        return jsonify({"message": MESSAGES[error_key]}), 400
    return None


def recover_eth_signer(message_content, signature):
    """
    Recupera la dirección del firmante a partir de un mensaje y firma

    Args:
        message_content (bytes): Contenido del mensaje original en bytes
        signature (str): Firma Ethereum válida (0x...)

    Returns:
        tuple: (signer_address, None) si éxito,
               (None, error_response) si error
    """
    try:
        msg = encode_defunct(message_content)
        return w3.eth.account.recover_message(msg, signature=signature), None
    except Exception as e:
        print(f"Error recovering signer: {str(e)}")
        return None, jsonify({"message": MESSAGES["INVALID_SIGNATURE"]}), 400


def verify_contract_signature(contract_address, call_id, signature):
    """
    Verifica una firma para el mensaje contract_address + call_id

    Combina validación de formato y recuperación de firmante
    """
    # Validar formato primero
    if error := validate_eth_signature_format(signature):
        return None, error

    try:
        # Preparar mensaje específico
        message = bytes.fromhex(contract_address[2:]) + bytes.fromhex(call_id[2:])
        # Recuperar firmante
        signer, error = recover_eth_signer(message, signature)
        return signer, error
    except Exception as e:
        print(f"Error verifying contract signature: {str(e)}")
        return None, jsonify({"message": MESSAGES["INVALID_SIGNATURE"]}), 400
