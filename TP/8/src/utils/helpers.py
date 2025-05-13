from flask import request, jsonify
from dateutil.parser import isoparse

from datetime import datetime
from messages import MESSAGES


def validate_json_content_type():
    """
    Valida que el tipo de contenido de la solicitud sea 'application/json'.
    Retorna una respuesta de error si no es válido, o None si es válido.
    """
    if request.content_type != "application/json":
        return jsonify({"message": MESSAGES["INVALID_MIMETYPE"]}), 400
    return None


def _is_valid_hash32(s):
    """'
    Valida un hash de 32 bytes en formato hexadecimal
    Args:
        s (str): String a validar
    Returns:
        bool: True si es un hash válido, False de lo contrario
    """
    if not isinstance(s, str) or not s.startswith("0x") or len(s) != 66:
        return False
    try:
        bytes.fromhex(s[2:])
        return True
    except ValueError:
        return False


def validate_hash32(hash_str, error_key="INVALID_HASH"):
    """ "
    Valida que una cadena sea un hash hexadecimal de 32 bytes (64 caracteres hexadecimales).

    Args:
        hash_str (str): Cadena que representa el hash a validar.
        error_key (str, optional): Clave del mensaje de error en el diccionario MESSAGES.
                                   Por defecto es "INVALID_HASH".

    Returns:
        Response | None:
            - Si es inválido, retorna una respuesta JSON con el mensaje de error y código 400.
            - Si es válido, retorna None.
    """
    if not _is_valid_hash32(hash_str):
        return jsonify({"message": MESSAGES[error_key]}), 400
    return None


def validate_eth_signature_format(signature):
    """Valida el formato básico de una firma Ethereum"""
    if (
        not isinstance(signature, str)
        or len(signature) != 132
        or not signature.startswith("0x")
    ):
        return jsonify({"message": MESSAGES["INVALID_SIGNATURE"]}), 400
    return None


def validate_closing_time(closing_time_str):
    """
    Valida y convierte una fecha/hora en formato ISO 8601 a un timestamp UNIX.

    La función verifica que la fecha proporcionada esté en formato ISO 8601
    y que represente un momento en el futuro con respecto a la hora actual.

    Args:
        closing_time_str (str): Cadena de fecha en formato ISO 8601 (ej. "2025-12-31T23:59:59Z").

    Returns:
        tuple:
            - (int, None, None): Si la fecha es válida. El primer valor es el timestamp UNIX.
            - (None, Response, int): Si la fecha es inválida. Incluye un mensaje de error JSON y un código de estado HTTP.
    """
    try:
        closing_time_dt = isoparse(closing_time_str)
        timestamp = int(closing_time_dt.timestamp())
        current_time = int(datetime.utcnow().timestamp())

        if timestamp <= current_time:
            return (
                None,
                jsonify(
                    {
                        "message": MESSAGES["INVALID_CLOSING_TIME"],
                        "detail": "Closing time must be in the future",
                    }
                ),
                400,
            )
        return timestamp, None, None
    except ValueError:
        return (
            None,
            jsonify(
                {
                    "message": MESSAGES["INVALID_TIME_FORMAT"],
                    "detail": "Time must be in ISO 8601 format (e.g., 2023-12-31T23:59:59Z)",
                }
            ),
            400,
        )
    except Exception as e:
        return (
            None,
            jsonify({"message": MESSAGES["INTERNAL_ERROR"], "detail": str(e)}),
            500,
        )


# def validate_closing_time(closing_time_str, allow_past=False):
#     """
#     Valida y convierte una fecha/hora en formato ISO 8601 a un timestamp UNIX.
#     Args:
#         closing_time_str (str): Cadena de fecha en formato ISO 8601 (ej. "2025-12-31T23:59:59Z").
#         allow_past (bool): Si es True, permite fechas en el pasado. Por defecto es False.

#     Returns:
#         tuple:
#             - (int, None, None): Si la fecha es válida. El primer valor es el timestamp UNIX.
#             - (None, Response, int): Si la fecha es inválida. Incluye un mensaje de error JSON y un código de estado HTTP.
#     """
#     try:
#         # Parsear el string ISO
#         closing_time_dt = isoparse(closing_time_str)
#         timestamp = int(closing_time_dt.timestamp())
#         current_time = int(datetime.utcnow().timestamp())

#         # Validar que no sea en el pasado (a menos que se permita)
#         if not allow_past and timestamp <= current_time:
#             return (
#                 None,
#                 jsonify(
#                     {
#                         "message": MESSAGES["INVALID_CLOSING_TIME"],
#                         "detail": "Closing time must be in the future",
#                     }
#                 ),
#                 400,
#             )

#         return timestamp, None, None

#     except ValueError:
#         # Para errores de formato ISO
#         return (
#             None,
#             jsonify(
#                 {
#                     "message": MESSAGES["INVALID_TIME_FORMAT"],
#                     "detail": "Time must be in ISO 8601 format (e.g., 2023-12-31T23:59:59Z)",
#                 }
#             ),
#             400,
#         )

#     except Exception as e:
#         # Para otros errores inesperados
#         return (
#             None,
#             jsonify({"message": MESSAGES["INTERNAL_ERROR"], "detail": str(e)}),
#             500,
#         )
