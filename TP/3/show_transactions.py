"""
Script para buscar transacciones en la blockchain.

Parámetros:
- ADDRESS: Lista de direcciones a buscar.
- --add: Agrega las direcciones encontradas a la búsqueda.
- --first-block, -f: Bloque inicial del rango de búsqueda (por defecto 0).
- --last-block, -l: Bloque final del rango de búsqueda (por defecto 'latest').
- --format: Formato de salida ('plain' o 'graphviz').
- --short: Muestra direcciones truncadas (8 caracteres).
- --uri: Especifica la conexión con el nodo Geth (IPC o HTTP).
- --unit: Unidad para mostrar los montos (wei, Kwei, Mwei, Gwei, microether, milliether, ether)

Ejemplo de uso:
    python script.py 0x123... 0x456... 0x789... --first-block 100 --last-block 200 --unit ether
    python script.py --add --short --format graphviz --unit Gwei
"""

import argparse
from web3 import Web3
from web3.middleware import geth_poa_middleware
import time
import sys

DEFAULT_IPC_PATH = "/home/simonll4/Desktop/blockchain-testnets/bfatest/node/geth.ipc"
DEFAULT_UNIT = "wei"


def init_web3_connection(uri):
    """Inicializa y valida la conexión con el nodo Ethereum"""
    try:
        w3 = Web3(Web3.IPCProvider(uri))
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        if not w3.is_connected():
            raise ConnectionError(
                f"No se pudo conectar al nodo Ethereum mediante {uri}"
            )

        return w3
    except Exception as e:
        raise ConnectionError(f"Error de conexión: {str(e)}")


def fetch_transactions(w3, first_block, last_block, addresses, add):
    """Busca transacciones que transfieren ETH en los bloques especificados."""

    # Normalizar direcciones
    tracked_addresses = set(addr.lower() for addr in addresses)
    transactions = []

    if last_block == "latest":
        last_block = w3.eth.block_number
    else:
        last_block = int(last_block)

    for block_number in range(first_block, last_block + 1):
        # Obtener el bloque con transacciones completas
        block = w3.eth.get_block(block_number, full_transactions=True)

        # Verificar si el bloque tiene transacciones
        if not block.transactions:
            continue

        for tx in block.transactions:
            if tx["value"] > 0:  # Solo transacciones con transferencia de Ether
                src, dst = tx["from"].lower(), (tx["to"] or "").lower()  # Normalizar
                if src in tracked_addresses or dst in tracked_addresses:
                    transactions.append((src, dst, tx["value"], block_number))
                    if add:
                        tracked_addresses.add(src)
                        if dst:
                            tracked_addresses.add(dst)
    return transactions


def print_transactions(transactions, output_format, short, unit):
    """Imprime las transacciones en el formato deseado."""
    if output_format == "plain":
        for src, dst, value_wei, block in transactions:
            value = Web3.from_wei(value_wei, unit)
            print(
                f"{format_address(src, short)} -> {format_address(dst, short)}: {value} {unit} (bloque {block})"
            )
    elif output_format == "graphviz":
        print("digraph Transfers {")
        for src, dst, value_wei, block in transactions:
            value = Web3.from_wei(value_wei, unit)
            print(
                f'  "{format_address(src, short)}" -> "{format_address(dst, short)}" [label="{value} {unit} ({block})"]'
            )
        print("}")


def address(x):
    """Verifica si el argumento tiene formato de dirección Ethereum válida."""
    if x[:2].lower() == "0x":
        try:
            b = bytes.fromhex(x[2:])
            if len(b) == 20:
                return Web3.to_checksum_address(x)  # Normalizar a checksum address
        except ValueError:
            pass
    raise argparse.ArgumentTypeError(f"Invalid address: '{x}'")


def format_address(addr, short):
    """Devuelve la dirección completa o truncada."""
    return addr[:10] if short else addr


if __name__ == "__main__":
    start_time = time.time()

    # Análisis de los argumentos
    parser = argparse.ArgumentParser(
        description="Muestra transacciones de Ether en un rango de bloques. Por defecto, intenta conectarse al nodo GETH mediante '{DEFAULT_IPC_PATH}"
    )

    parser.add_argument(
        "--uri", help="URI para la conexión con geth", default=DEFAULT_IPC_PATH
    )

    parser.add_argument(
        "addresses",
        metavar="ADDRESS",
        type=address,
        nargs="*",
        help="Direcciones a buscar",
    )
    parser.add_argument(
        "--add",
        help="Agrega las direcciones encontradas a la búsqueda",
        action="store_true",
    )
    parser.add_argument(
        "--first-block", "-f", help="Primer bloque del rango", type=int, default=0
    )
    parser.add_argument(
        "--last-block", "-l", help="Último bloque del rango", default="latest"
    )
    parser.add_argument(
        "--format",
        help="Formato de salida",
        choices=["plain", "graphviz"],
        default="plain",
    )
    parser.add_argument(
        "--short", help="Trunca las direcciones a 10 caracteres", action="store_true"
    )
    parser.add_argument(
        "--unit",
        help="Unidades para mostrar los montos",
        choices=["wei", "Kwei", "Mwei", "Gwei", "microether", "milliether", "ether"],
        default=DEFAULT_UNIT,
    )
    
    args = parser.parse_args()
    
    try:
        # Conexión con el nodo Geth usando IPC
        w3 = init_web3_connection(args.uri)

        # Buscar transacciones
        transactions = fetch_transactions(
            w3, args.first_block, args.last_block, args.addresses, args.add
        )
        print_transactions(transactions, args.format, args.short, args.unit)

        elapsed_time = time.time() - start_time
        print(f"Tiempo de ejecución: {elapsed_time:.2f} segundos")

    except Exception as e:
        print(f"Error al procesar las transacciones: {str(e)}", file=sys.stderr)
        sys.exit(1)
