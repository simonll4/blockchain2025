import requests

# Constantes del generador de Java
MULTIPLIER = 0x5DEECE66D  # Multiplicador del generador (25214903917 en decimal)
INCREMENT = 0xB  # Incremento del generador (11 en decimal)
MODULUS = 1 << 48  # Módulo del generador (2^48)

# Configuración del servidor
SERVER = "https://cripto.iua.edu.ar/blockchain"
EMAIL = "sllamosas806@alumnos.iua.edu.ar"


def get_number():
    """
    Obtiene un número aleatorio generado por el servidor.

    Returns:
        int: Número aleatorio de 32 bits con signo.

    Raises:
        Exception: Si la solicitud al servidor falla.
    """
    url = f"{SERVER}/javarand/{EMAIL}/challenge"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(
            f"Error al obtener el número del servidor: {response.status_code}, {response.text}"
        )

    value = int(response.text)

    if value & (1 << 31):  # Si el número es mayor o igual a 2^31 (bit de signo activo)
        value -= 1 << 32  # Restamos 2^32 para ajustarlo a complemento a dos

    return value


def reverse_seed(n1, n2):
    """
    Reconstruye el seed del generador a partir de dos números consecutivos.

    Args:
        n1 (int): Primer número aleatorio obtenido.
        n2 (int): Segundo número aleatorio obtenido.

    Returns:
        int | None: El seed reconstruido si se encuentra, None en caso contrario.
    """
    # Asegurar que los valores sean de 32 bits con signo
    n1 &= 0xFFFFFFFF
    n2 &= 0xFFFFFFFF

    for unknown_bits in range(
        0, 1 << 16
    ):  # Explorar los 16 bits menos significativos desconocidos
        seed_candidate = (n1 << 16) | unknown_bits
        next_seed_candidate = (seed_candidate * MULTIPLIER + INCREMENT) & (MODULUS - 1)
        predicted_n2 = next_seed_candidate >> 16

        if predicted_n2 == n2:
            return next_seed_candidate  # Se encontro un seed valido

    return None  # No se encontró un seed valido


def predict_next_number(seed):
    """
    Predice el siguiente número aleatorio basado en el seed reconstruido.

    Args:
        seed (int): Seed reconstruido del generador de números aleatorios.

    Returns:
        int: Número predicho de 32 bits con signo.
    """
    next_seed = (seed * MULTIPLIER + INCREMENT) & (MODULUS - 1)
    next_value = next_seed >> 16

    # Convertir a 32 bits con signo si es necesario
    if next_value & (1 << 31):
        next_value -= 1 << 32

    return next_value


def send_prediction(predicted_number):
    """
    Envía el número predicho al servidor para su validación.

    Args:
        predicted_number (int): Número predicho basado en el generador de Java.

    Returns:
        tuple: Código de estado de la respuesta y mensaje del servidor.

    Raises:
        Exception: Si la solicitud al servidor falla.
    """
    url = f"{SERVER}/javarand/{EMAIL}/answer"
    response = requests.post(
        url, files={"number": str(predicted_number).encode("ascii")}
    )
    if response.status_code != 200:
        raise Exception(
            f"Error al enviar la predicción: {response.status_code}, {response.text}"
        )

    return response.status_code, response.text


if __name__ == "__main__":
    try:
        # Paso 1: Obtener dos numeros consecutivos del servidor
        n1 = get_number()
        n2 = get_number()

        # Paso 2: Intentar reconstruir el seed a partir de los dos numeros obtenidos
        seed = reverse_seed(n1, n2)

        if seed is not None:
            # Paso 3: Si el seed fue reconstruido correctamente, predecir el siguiente numero
            n3 = predict_next_number(seed)

            # Paso 4: Enviar la prediccion al servidor
            status_code, response_text = send_prediction(n3)

            # Mostrar resultados
            print(f"Número 1: {n1}")
            print(f"Número 2: {n2}")
            print(f"Seed reconstruido: {seed}")
            print(f"Número predicho: {n3}")
            print(f"Status Code: {status_code}")
            print(f"Respuesta del servidor: {response_text}")
        else:
            print("No se pudo reconstruir el seed.")
    except Exception as e:
        print(f"Error: {e}")
