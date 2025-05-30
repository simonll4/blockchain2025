from web3 import Web3, Account
from eth_account.messages import encode_defunct
import json
from flask import jsonify

from .config_loader import load_config
from .helpers import validate_eth_signature_format
from messages import MESSAGES

Account.enable_unaudited_hdwallet_features()

# Cargar la configuración desde el archivo de configuración  (config/config.json)
config = load_config()
ganache_url = config.get("ganache_url")

hd_path_template = config.get("hd_path_template")
w3 = Web3(Web3.HTTPProvider(ganache_url))

# Verificar la conexión al nodo Ethereum
if not w3.is_connected():
    raise ConnectionError(f"No se pudo conectar al nodo Ethereum en {ganache_url}")


def get_account(mnemonic, index):
    """
    Deriva una cuenta Ethereum a partir de un mnemonic y un índice, usando el HD path definido en la configuración.

    Args:
        mnemonic (str): Frase mnemónica de 12 o 24 palabras.
        index (int): Índice de la cuenta a derivar.

    Returns:
        LocalAccount: Objeto de cuenta derivado de la mnemónica y el índice especificado.
    """
    if "{index}" not in hd_path_template:
        raise ValueError("La plantilla del HD path debe incluir '{index}'")

    path = hd_path_template.format(index=index)
    return Account.from_mnemonic(mnemonic, account_path=path)


def load_contract(w3, path,network_id):  
    """
    Carga e instancia un contrato inteligente desde un archivo JSON compilado.

    Args:
        w3 (Web3): Instancia de Web3 conectada a un nodo Ethereum.
        path (str): Ruta al archivo JSON que contiene el ABI y la dirección del contrato.

    Returns:
        web3.contract.Contract: Instancia del contrato desplegado lista para interactuar.
    """

    with open(path) as f:
        contract_data = json.load(f)
    abi = contract_data["abi"]
    address = Web3.to_checksum_address(contract_data["networks"][network_id ]["address"])
    return w3.eth.contract(address=address, abi=abi)


def load_dynamic_contract(w3, contract_address, CFP_ABI):
    """
    Carga un contrato inteligente en la red Ethereum usando una dirección de contrato y su ABI.

    Args:
        w3 (Web3): Instancia de Web3 conectada a un nodo Ethereum.
        contract_address (str): Dirección del contrato desplegado en la red Ethereum.
        CFP_ABI: ABI del contrato, que define las funciones y eventos del contrato.

    Returns:
        web3.contract.Contract: Instancia del contrato desplegado lista para interactuar.
    """
    return w3.eth.contract(address=contract_address, abi=CFP_ABI)


def validate_address(address, error_key="INVALID_ADDRESS"):
    """
    Valida si una dirección Ethereum es válida.

    Args:
        address (str): Dirección Ethereum a validar.
        error_key (str, opcional): Clave de error que se utilizará para el mensaje de error.
                                   Por defecto es "INVALID_ADDRESS".

    Returns:
        tuple:
            - (None) si la dirección es válida.
            - (Response, int) Si la dirección no es válida, retorna un mensaje de error JSON y el código de estado HTTP 400.
    """
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
    Verifica la firma de un mensaje compuesto por la dirección del contrato y un call_id.

    Args:
        contract_address (str): Dirección del contrato Ethereum.
        call_id (str): Identificador de la llamada que se va a verificar.
        signature (str): Firma de la transacción que se va a verificar.

    Returns:
        tuple:
            - (signer, None) si la firma es válida, donde 'signer' es la dirección del firmante recuperada.
            - (None, error_response) si la firma no es válida, donde 'error_response' es un objeto JSON con el mensaje de error y código HTTP 400.
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
