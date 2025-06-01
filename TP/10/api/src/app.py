"""API REST en Flask que interactúa con los contratos inteligentes CFP y CFPFactory desplegados en Ganache.
Esta API permite crear llamados, registrar propuestas, autorizar usuarios y consultar datos relevantes
a través de endpoints HTTP conforme a la especificación definida en el archivo README.md.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
from eth_account.messages import encode_defunct
from datetime import datetime, timezone
import json

from utils.config_loader import load_config
from utils.web3_utils import (
    get_account,
    load_contract,
    load_dynamic_contract,
    validate_address,
    verify_contract_signature,
    w3,
)
from utils.helpers import (
    validate_json_content_type,
    validate_hash32,
    validate_closing_time,
    validate_eth_signature_format,
)
from messages import MESSAGES


app = Flask(__name__)
config = load_config()
CORS(app, origins=["http://localhost:5173"])

# Configuración
mnemonic = config.get("mnemonic")
index = config.get("account_index", 0)
network_id = config.get("network_id", "5777")

# Conectar cuenta por defecto
account = get_account(mnemonic, index)

# Cargar el contrato Factory
factory = load_contract(w3, config["factory_contract_path"], network_id)

# Cargar el ABI del contrato CFP
with open(config["cfp_contract_path"]) as f:
    CFP_ABI = json.load(f)["abi"]
    
    
@app.route("/check-health", methods=["GET"])
def check_health():
    try:
        return "", 200
    except Exception as e:
        app.logger.error(f"Health check failed: {e}")
        return jsonify({"status": "error", "message": "Service unavailable"}), 503


@app.route("/create", methods=["POST"])
def create_call():

    # Validación del tipo de contenido
    validation_error = validate_json_content_type()
    if validation_error:
        return validation_error

    # Extracción de datos del body de la solicitud
    data = request.get_json()
    call_id = data.get("callId")
    closing_time = data.get("closingTime")
    signature = data.get("signature")

    # Validacion de campo callId
    validation_error = validate_hash32(call_id, "INVALID_CALLID")
    if validation_error:
        return validation_error

    # Validación de campo closingTime
    timestamp, error_response, status_code = validate_closing_time(closing_time)
    if error_response:
        return error_response, status_code

    # Validación de firma
    signer, error = verify_contract_signature(factory.address, call_id, signature)
    if error:
        return error

    try:
        # Verificar si el firmante esta autorizado a crear llamados
        if not factory.functions.isAuthorized(signer).call():
            return jsonify({"message": MESSAGES["UNAUTHORIZED"]}), 403

        # Verificar si la llamada existe
        created_call = factory.functions.calls(call_id).call()
        if created_call[0] != "0x0000000000000000000000000000000000000000":
            return jsonify({"message": MESSAGES["ALREADY_CREATED"]}), 403

        # ESTIMACIÓN DE GAS
        try:
            gas_estimate = factory.functions.createFor(
                Web3.to_bytes(hexstr=call_id), timestamp, signer
            ).estimate_gas({"from": account.address})
            # 20% de margen
            gas_with_margin = int(gas_estimate * 1.2)
        except Exception as e:
            print(f"Error al estimar gas: {e}")
            return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500

        # Construcción de la transacción
        tx = factory.functions.createFor(
            Web3.to_bytes(hexstr=call_id), timestamp, signer
        ).build_transaction(
            {
                "from": account.address,
                "nonce": w3.eth.get_transaction_count(account.address),
                "gas": gas_with_margin,
                "maxFeePerGas": w3.to_wei("50", "gwei"),
                "maxPriorityFeePerGas": w3.to_wei("2", "gwei"),
            }
        )

        # Firma y envío
        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)

        return (
            jsonify({"message": MESSAGES["OK"], "transactionHash": tx_hash.hex()}),
            201,
        )
    except Exception as e:
        print(f"Error en create_call: {str(e)}")
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/closing-time/<call_id>", methods=["GET"])
def get_closing_time(call_id):
    try:
        # Validación del call_id
        validation_error = validate_hash32(call_id, "INVALID_CALLID")
        if validation_error:
            return validation_error

        # Obtener datos del llamado desde el Factory
        call_bytes = Web3.to_bytes(hexstr=call_id)
        call_data = factory.functions.calls(call_bytes).call()

        # Verificar si el llamado existe
        if call_data[0] == "0x0000000000000000000000000000000000000000":
            return jsonify({"message": MESSAGES["CALLID_NOT_FOUND"]}), 404

        # Cargar contrato CFP usando la función helper
        cfp = load_dynamic_contract(w3, call_data[1], CFP_ABI)

        # Obtener timestamp de cierre
        closing_timestamp = cfp.functions.closingTime().call()

        # Convertir a ISO 8601 con zona UTC explícita
        closing_time_iso = datetime.fromtimestamp(
            closing_timestamp, timezone.utc
        ).isoformat()

        return jsonify({"closingTime": closing_time_iso}), 200
    except ValueError as ve:
        app.logger.error(f"Error de validación: {str(ve)}")
        return jsonify({"message": MESSAGES["INVALID_INPUT"]}), 400
    except Exception as e:
        app.logger.error(
            f"Error en get_closing_time - call_id: {call_id}, error: {str(e)}",
            exc_info=True,
        )
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/calls/<call_id>", methods=["GET"])
def get_call(call_id):
    try:
        # Validación del call_id
        validation_error = validate_hash32(call_id, "INVALID_CALLID")
        if validation_error:
            return validation_error

        # Obtener datos del llamado desde el Factory
        call_data = factory.functions.calls(Web3.to_bytes(hexstr=call_id)).call()

        # Verificación si el call existe
        if call_data[0] == "0x0000000000000000000000000000000000000000":
            return jsonify({"message": MESSAGES["CALLID_NOT_FOUND"]}), 404

        # Formateo de la respuesta
        response = {
            "creator": call_data[0],  # Dirección del creador
            "cfp": call_data[1],  # Dirección del contrato CFP
        }

        return jsonify(response), 200
    except Exception as e:
        print(f"Error en get_call: {str(e)}")
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/contract-address", methods=["GET"])
def contract_address():
    # Obtener la dirección del contrato Factory
    return jsonify({"address": factory.address}), 200


@app.route("/contract-owner", methods=["GET"])
def contract_owner():
    # Obtener la dirección del propietario del contrato Factory
    try:
        owner = factory.functions.owner().call()
        return jsonify({"address": owner}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/register", methods=["POST"])
def register():

    # Validación del tipo de contenido
    validation_error = validate_json_content_type()
    if validation_error:
        return validation_error

    # Extracción de datos del body de la solicitud
    data = request.get_json()
    address = data.get("address")
    signature = data.get("signature")

    # Validación de la dirección a registrar
    validation_error = validate_address(address, "INVALID_ADDRESS")
    if validation_error:
        return validation_error

    # Validación de la firma
    if error := validate_eth_signature_format(signature):
        return error

    try:
        # Recuperar el firmante
        msg = encode_defunct(hexstr=factory.address[2:])
        signer = w3.eth.account.recover_message(msg, signature=signature)

        # Verificar si la dirección firmante coincide con la dirección proporcionada a registrar
        if Web3.to_checksum_address(signer) != Web3.to_checksum_address(address):
            return jsonify({"message": MESSAGES["INVALID_SIGNATURE"]}), 400

        # Verificar si la dirección ya está autorizada
        if factory.functions.isAuthorized(address).call():
            return jsonify({"message": MESSAGES["ALREADY_AUTHORIZED"]}), 403

        # Construir, firmar y enviar la transacción authorize que implica registrar
        tx = factory.functions.authorize(address).build_transaction(
            {
                "from": account.address,
                "nonce": w3.eth.get_transaction_count(account.address),
                "gas": 500000,
            }
        )

        signed = account.sign_transaction(tx)
        w3.eth.send_raw_transaction(signed.rawTransaction)
        return jsonify({"message": MESSAGES["OK"]}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/authorized/<address>", methods=["GET"])
def check_authorization(address):
    # Validación del tipo de contenido
    validation_error = validate_address(address, "INVALID_ADDRESS")
    if validation_error:
        return validation_error

    try:
        # Verificar si la dirección está autorizada
        authorized = factory.functions.isAuthorized(
            Web3.to_checksum_address(address)
        ).call()
        return jsonify({"authorized": authorized}), 200
    except Exception as e:
        print(f"[ERROR] check_authorization: {e}")
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/register-proposal", methods=["POST"])
def register_proposal():

    # Validación del tipo de contenido
    validation_error = validate_json_content_type()
    if validation_error:
        return validation_error

    # Extracción de datos del body de la solicitud
    data = request.get_json()
    call_id = data.get("callId")
    proposal = data.get("proposal")

    # Validación del campo callId
    validation_error = validate_hash32(call_id, "INVALID_CALLID")
    if validation_error:
        return validation_error

    # Validación del camposproposal
    validation_error = validate_hash32(proposal, "INVALID_PROPOSAL")
    if validation_error:
        return validation_error

    try:
        # Obtener datos del llamado, si existe
        created_call = factory.functions.calls(call_id).call()
        if created_call[0] == Web3.to_checksum_address(
            "0x0000000000000000000000000000000000000000"
        ):
            return jsonify({"message": MESSAGES["CALLID_NOT_FOUND"]}), 404

        # Obtener dirección del contrato CFP desde el struct
        cfp_address = created_call[1]
        # Cargar el contrato CFP
        cfp = load_dynamic_contract(w3, cfp_address, CFP_ABI)

        # Verificar si la dirección ya se registró
        data = cfp.functions.proposalData(proposal).call()
        if Web3.to_checksum_address(data[0]) != Web3.to_checksum_address(
            "0x0000000000000000000000000000000000000000"
        ):
            return jsonify({"message": MESSAGES["ALREADY_REGISTERED"]}), 403

        # Construir, firmar y enviar la transacción
        tx = factory.functions.registerProposal(
            Web3.to_bytes(hexstr=call_id),  # callId como bytes32
            Web3.to_bytes(hexstr=proposal),  # proposal como bytes32
        ).build_transaction(
            {
                "from": account.address,
                "nonce": w3.eth.get_transaction_count(account.address),
                "gas": 500000,
            }
        )

        # Firmar y enviar la transacción
        signed_tx = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

        return jsonify({"message": MESSAGES["OK"], "txHash": tx_hash.hex()}), 201
    except Exception as e:
        print(f"[ERROR] register_proposal: {e}")
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/proposal-data/<call_id>/<proposal>", methods=["GET"])
def get_proposal_data(call_id, proposal):
    try:
        # Validación del tipo de contenido
        validation_error = validate_hash32(call_id, "INVALID_CALLID")
        if validation_error:
            return validation_error

        # Validación del campo proposal
        validation_error = validate_hash32(proposal, "INVALID_PROPOSAL")
        if validation_error:
            return validation_error

        # Consultar si el call_id existe
        call_data = factory.functions.calls(Web3.to_bytes(hexstr=call_id)).call()
        if call_data[0] == "0x0000000000000000000000000000000000000000":
            return jsonify({"message": MESSAGES["CALLID_NOT_FOUND"]}), 404

        # Cargar contrato CFP
        cfp_address = call_data[1]
        cfp = load_dynamic_contract(w3, cfp_address, CFP_ABI)

        # Obtener datos de la propuesta
        data = cfp.functions.proposalData(Web3.to_bytes(hexstr=proposal)).call()
        sender = data[0]
        block_number = data[1]
        timestamp = data[2]

        # Verificar si la propuesta existe
        if sender == "0x0000000000000000000000000000000000000000":
            return jsonify({"message": MESSAGES["PROPOSAL_NOT_FOUND"]}), 404

        # Formatear la respuesta
        response = {
            "sender": Web3.to_checksum_address(sender),
            "blockNumber": block_number,
            "timestamp": datetime.fromtimestamp(timestamp, timezone.utc).isoformat(),
        }

        return jsonify(response), 200
    except Exception as e:
        print(f"[ERROR] get_proposal_data: {e}")
        return jsonify({"message": MESSAGES["INTERNAL_ERROR"]}), 500


@app.route("/calls", methods=["GET"])
def get_all_calls():
    call_ids = factory.functions.allCallIds().call()

    calls = []
    for call_id in call_ids:
        call = factory.functions.calls(call_id).call()
        cfp_address = call[1]
        closing_time_iso = None
        try:
            # Cargar el contrato CFP y obtener el closingTime
            cfp = load_dynamic_contract(w3, cfp_address, CFP_ABI)
            closing_time = cfp.functions.closingTime().call()
            closing_time_iso = datetime.fromtimestamp(closing_time, timezone.utc).isoformat()
        except Exception as e:
            print(f"[ERROR] get_all_calls: No se pudo obtener closingTime para {cfp_address}: {e}")

        calls.append(
            {
                "callId": "0x" + call_id.hex(),
                "creator": call[0],
                "cfpAddress": cfp_address,
                "closingTime": closing_time_iso,
            }
        )

    return jsonify(calls)


#TODO docuementar los endpoints

@app.route("/creators", methods=["GET"])
def get_all_creators():
    try:
        count = factory.functions.creatorsCount().call()
        creators = []

        for i in range(count):
            creator = factory.functions.creators(i).call()
            creators.append(creator)

        return jsonify({"creators": creators}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/pending", methods=["GET"])
def get_pending():
    try:
        # Verificar que se accede con la cuenta owner
        pending_count = factory.functions.pendingCount().call({'from': account.address})
        
        pending = []
        for i in range(pending_count):
            addr = factory.functions.getPending(i).call({'from': account.address})
            pending.append(addr)

        return jsonify({
            "pending": pending
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(port=5000)
