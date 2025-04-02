import requests
import hashlib
from base64 import b64encode

# Configuración del servidor
EMAIL = "sllamosas806@alumnos.iua.edu.ar"
BASE_URL = f"https://cripto.iua.edu.ar/blockchain/dsa/{EMAIL}"


def get_public_key():
    """
    Obtiene la clave pública del servidor.

    Returns:
        dict: Un diccionario con los parámetros de la clave pública (p, q, g, y).

    Raises:
        Exception: Si la solicitud falla.
    """
    url = f"{BASE_URL}/public-key"

    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error al obtener la clave pública: {response.status_code}")


def get_signature(message):
    """
    Obtiene la firma de un mensaje desde el servidor.

    Args:
        message (str): El mensaje a firmar.

    Returns:
        dict: Un diccionario con los valores de la firma (r, s).

    Raises:
        Exception: Si la solicitud falla.
    """
    url = f"{BASE_URL}/sign"
    message_b64 = b64encode(message.encode()).decode()
    files = {"message": ("file", message_b64)}

    response = requests.post(url, files=files)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(
            f"Error al obtener la firma: {response.status_code}, Respuesta: {response.text}"
        )


def calculate_private_key(m1, s1, m2, s2, r, q):
    """
    Calcula la clave privada x utilizando dos firmas con el mismo valor de r.

    Args:
        m1 (str): Primer mensaje.
        s1 (int): Valor s de la primera firma.
        m2 (str): Segundo mensaje.
        s2 (int): Valor s de la segunda firma.
        r (int): Valor r.
        q (int): Parámetro q de la clave pública.

    Returns:
        int: La clave privada x calculada.
    """
    # Calcular los hashes de los mensajes
    # se asume que el mensaje es un string, si el mensaje es una cadena de bytes no se esta completando
    # haslib sha256 necesita una cadena de bytes y devuelve una cadena de bytes
    # con digest() y luego intFromBytes() se puede convertir a un entero para que sea mas eficiente
    H_m1 = int(hashlib.sha256(m1.encode()).hexdigest(), 16)
    H_m2 = int(hashlib.sha256(m2.encode()).hexdigest(), 16)

    # Calcular k
    k = ((H_m1 - H_m2) * pow(s1 - s2, -1, q)) % q
    # Calcular x
    x = (pow(r, -1, q) * (k * s1 - H_m1)) % q

    return x


def send_private_key(x):
    """
    Envía la clave privada x al servidor para su verificación.

    Args:
        x (int): La clave privada calculada.

    Raises:
        Exception: Si la solicitud falla.
    """
    url = f"{BASE_URL}/answer"
    files = {"private-key": ("file", str(x))}

    response = requests.post(url, files=files)
    if response.status_code == 200:
        print("Server response:", response.text)
    else:
        raise Exception(
            f"Error al enviar la clave privada: {response.status_code}, Respuesta: {response.text}"
        )


if __name__ == "__main__":
    # Paso 1: Obtener la clave pública
    public_key = get_public_key()
    p = int(public_key["P"])
    q = int(public_key["Q"])
    g = int(public_key["G"])
    y = int(public_key["Y"])

    print("clave publica obtenida:")
    print(f"p = {p}")
    print(f"q = {q}")
    print(f"g = {g}")
    print(f"y = {y}")

    # Paso 2: Obtener dos firmas con el mismo r (reutilización de k)
    message1 = "PRIMER MENSAJE"
    signature1 = get_signature(message1)
    r1 = int(signature1["r"])
    s1 = int(signature1["s"])

    message2 = "SEGUNDO MENSAJE"
    signature2 = get_signature(message2)
    r2 = int(signature2["r"])
    s2 = int(signature2["s"])

    print("\nFIRMAS OBTENIDAS:")
    print(f"firma 1 (r = {r1}, s = {s1})")
    print(f"firma 2 (r = {r2}, s = {s2})")

    # PASO 3: Verificar si r es el mismo (reutilización de k)
    if r1 == r2:

        # Paso 4: Calcular la clave privada x
        print("\nSe detectó reutilización de k. Calculando la clave privada x...")
        x = calculate_private_key(message1, s1, message2, s2, r1, q)
        print(f"Clave privada x calculada:{x}")

        # Paso 5: Enviar la clave privada al servidor
        print("\nEnviando clave privada al servidor...")
        send_private_key(x)

    else:
        print("\nNo se detectó reutilización de k. intentalo nuevamente")
