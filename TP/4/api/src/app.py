from flask import Flask, jsonify, request
import logging

from config import (
    PORT,
    NODE_URI,
    CONTRACT_PATH,
    NETWORK_ID,
    KEYSTORE_DIR,
    PASSWORD_FILE,
)
from ethereum_utils import (
    connect_to_node,
    get_local_account,
    build_and_sign_transaction,
    load_contract,
    is_valid_format_hash,
    is_valid_signature,
)


# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Inicializar conexión y cuenta
try:
    w3 = connect_to_node(NODE_URI)
    account_address, private_key = get_local_account(KEYSTORE_DIR, PASSWORD_FILE)

    contract = load_contract(w3, CONTRACT_PATH, NETWORK_ID)
except Exception as e:
    logger.error("Error inicializando la conexión con el nodo: %s", e)
    contract = None


@app.route("/stamped/<hash_value>", methods=["GET"])
def get_stamped(hash_value):
    """Devuelve el registro de un hash"""

    if not is_valid_format_hash(hash_value):
        return jsonify(message="Invalid hash format"), 400

    try:
        stamped_data = contract.functions.stamped(hash_value).call()
        if stamped_data[0] != "0x0000000000000000000000000000000000000000":
            return jsonify(signer=stamped_data[0], blockNumber=stamped_data[1]), 200
        return jsonify(message="Hash not found"), 404
    except Exception as e:
        logger.error("Error en stamped: %s", e)
        return jsonify(message="Internal server error"), 500


@app.route("/stamp", methods=["POST"])
def post_stamp():
    """Registra un hash en la blockchain"""
    if request.mimetype != "application/json":
        return jsonify(message="Invalid Content-Type"), 400

    try:
        req = request.get_json()
        hash_value = req.get("hash")
        signature = req.get("signature")

        # Validar el hash
        if not hash_value or not is_valid_format_hash(hash_value):
            return jsonify(message="Invalid hash format"), 400

        # Validar la firma si está presente
        if signature is not None:
            if not is_valid_signature(hash_value, signature):
                return jsonify(message="Invalid signature format"), 400

    except Exception as e:
        logger.error("Error parsing request: %s", e)
        return jsonify(message="Invalid request format"), 400

    try:
        # Verificar si el hash ya está registrado
        stamped_data = contract.functions.stamped(hash_value).call()
        if stamped_data[0] != "0x0000000000000000000000000000000000000000":
            return (
                jsonify(
                    message="Hash already stamped",
                    signer=stamped_data[0],
                    blockNumber=stamped_data[1],
                ),
                403,
            )

        # Construir y firmar transacción
        signed_tx = build_and_sign_transaction(
            w3, contract, account_address, private_key, hash_value, signature
        )

        # Enviar la transacción
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        # Esperar el recibo de la transacción
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if tx_receipt.status != 1:
            return jsonify(message="Transaction failed"), 500

        return (
            jsonify(transaction=tx_hash.hex(), blockNumber=tx_receipt.blockNumber),
            201,
        )

    except Exception as e:
        logger.error("Error in stamp: %s", e)
        return jsonify(message="Internal server error"), 500


if __name__ == "__main__":
    app.run(host="localhost", port=PORT, debug=True)
