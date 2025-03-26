"""
Script para gestionar cuentas en una red Ethereum.

Comandos disponibles:
- balance: Consulta el saldo de una cuenta.
- transfer: Envía fondos de una cuenta a otra.
- accounts: Lista las cuentas disponibles en el nodo.

Ejemplo de uso:
- Consultar balance de cuenta: python3 bfa_funds.py balance --account {0x123... / indice de cuenta en el nodo} --unit ether
- Transferencia de ether: python3 bfa_funds.py transfer --from {0x123... / indice de cuenta en el nodo} --to {0x123... / indice de cuenta en el nodo}
    --amount 1 --unit ether --password "password de cuenta origen"  # Usa índices
- Consultar todas las cuentas en el nodo: python3 bfa_funds.py accounts

"""

import argparse
import sys
from web3 import Web3
from web3.middleware import geth_poa_middleware

# Configuración por defecto
DEFAULT_IPC_PATH = "/home/simonll4/Desktop/blockchain-testnets/bfatest/node/geth.ipc"  # Cambiar por la ruta correcta en su sistema
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


def balance(w3, account_ref, unit):
    """Imprime el balance de una cuenta"""
    try:
        account = get_account(w3, account_ref)
        balance_wei = w3.eth.get_balance(account)
        balance_converted = Web3.from_wei(balance_wei, unit)
        print(f"Balance de {account}: {balance_converted} {unit}")
    except Exception as e:
        print(f"Error al obtener balance: {str(e)}", file=sys.stderr)
        sys.exit(1)


def transfer(w3, src_ref, dst_ref, amount, unit, password):
    """Transfiere ether de una cuenta a otra."""
    try:
        # Obtener las cuentas
        src = get_account(w3, src_ref)
        dst = get_account(w3, dst_ref)

        # Convertir el monto a wei
        amount_wei = Web3.to_wei(amount, unit)

        # Verificar saldo suficiente
        balance_src = w3.eth.get_balance(src)

        if balance_src < amount_wei:
            print(
                f"Saldo insuficiente en la cuenta origen. Balance: {Web3.from_wei(balance_src, 'ether')} ETH, Intenta transferir: {amount} {unit}",
                file=sys.stderr,
            )
            sys.exit(1)

        # Desbloquear cuenta origen si está en el nodo
        if src in w3.eth.accounts:
            if not unlock_account(w3, src, password):
                print("No se pudo desbloquear la cuenta origen", file=sys.stderr)
                sys.exit(1)

        # Construir y enviar transacción
        tx_hash = w3.eth.send_transaction(
            {
                "from": src,
                "to": dst,
                "value": amount_wei,
                # calculo de gas automatico
            }
        )

        # Esperar por la confirmación de la transacción
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if tx_receipt.status == 1:
            print(f"Transferencia exitosa. TX Hash: {tx_hash.hex()}")
        else:
            print("La transacción falló", file=sys.stderr)
            sys.exit(1)
    except ValueError as e:
        print(f"Error en los parámetros de la transacción: {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error en transferencia: {str(e)}", file=sys.stderr)
        sys.exit(1)


def accounts(w3):
    """Lista las cuentas asociadas con un nodo y su balance"""
    try:
        accs = w3.eth.accounts
        if accs:
            print("Cuentas disponibles en el nodo:")
            for i, acc in enumerate(accs):
                balance_wei = w3.eth.get_balance(acc)
                balance_eth = Web3.from_wei(balance_wei, "ether")
                print(f"{i}. {acc} - Balance: {balance_eth} ETH")
        else:
            print("No hay cuentas en este nodo.")
    except Exception as e:
        print(f"Error al listar cuentas: {str(e)}", file=sys.stderr)
        sys.exit(1)


def address_or_index(x):
    """
    Verifica si el argumento es una dirección Ethereum válida o un índice numérico.
    Devuelve el valor sin modificar para procesarlo luego con get_account.
    """
    # Si es un número, lo devolvemos como string
    try:
        index = int(x)
        return str(index)
    except ValueError:
        pass

    # Si no es un número, verificamos si es una dirección válida
    if x[:2] == "0x" or x[:2] == "0X":
        try:
            b = bytes.fromhex(x[2:])
            if len(b) == 20:
                return Web3.to_checksum_address(x)
        except ValueError:
            pass

    raise argparse.ArgumentTypeError(
        f"Referencia de cuenta inválida: '{x}'. Debe ser una dirección Ethereum (0x...) o un índice numérico"
    )


def get_account(w3, account_ref):
    """
    Obtiene una dirección de cuenta a partir de una referencia que puede ser:
    - Una dirección Ethereum (0x...)
    - Un índice numérico de la lista de cuentas del nodo
    """
    try:
        # Si es un índice numérico
        if account_ref.isdigit():
            index = int(account_ref)
            accounts = w3.eth.accounts
            if index < 0 or index >= len(accounts):
                print(
                    f"Índice de cuenta inválido: {index}. El nodo tiene {len(accounts)} cuentas"
                )
                sys.exit(1)
            return accounts[index]

        # Si es una dirección (ya validada por address_or_index)
        return account_ref

    except Exception as e:
        print(f"Error al obtener cuenta: {str(e)}", file=sys.stderr)
        sys.exit(1)


def unlock_account(w3, account, password):
    """Desbloquea una cuenta temporalmente para realizar transacciones"""
    if account not in w3.eth.accounts:
        print(
            f"La cuenta {account} no está en la lista de cuentas del nodo",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        return w3.geth.personal.unlock_account(
            account, password, 30
        )  # desbloquea por 30 segundos
    except Exception as e:
        print(f"Error al desbloquear cuenta: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    # Configuración del parser principal
    parser = argparse.ArgumentParser(
        description=f"""Maneja los fondos de una cuenta en una red Ethereum. Permite consultar el balance y realizar transferencias. 
                        Por defecto, intenta conectarse al nodo GETH mediante '{DEFAULT_IPC_PATH}'""",
        usage=argparse.SUPPRESS,
        add_help=False,
    )

    parser.add_argument(
        "--uri", help="URI para la conexión con geth", default=DEFAULT_IPC_PATH
    )

    # Añadimos manualmente el parámetro de ayuda
    parser.add_argument(
        "-h",
        "--help",
        action="store_true",
        help="Mostrar este mensaje de ayuda y salir",
    )

    # Configuración de los subparsers
    subparsers = parser.add_subparsers(
        title="Comandos disponibles", dest="command", metavar="", required=True
    )

    # Función para crear parsers sin ayuda automática
    def create_subparser(*args, **kwargs):
        kwargs["add_help"] = False
        return subparsers.add_parser(*args, **kwargs)

    # Comando balance
    balance_parser = create_subparser(
        "balance", help="Consulta el saldo de una cuenta en el nodo"
    )
    balance_parser.add_argument(
        "-a",
        "--account",
        help="Dirección de la cuenta o índice numérico",
        type=address_or_index,
        required=True,
    )
    balance_parser.add_argument(
        "--unit",
        help="Unidades para mostrar el balance",
        choices=["wei", "Kwei", "Mwei", "Gwei", "microether", "milliether", "ether"],
        default=DEFAULT_UNIT,
    )

    # Comando transfer
    transfer_parser = create_subparser(
        "transfer", help="Realiza una transferencia entre cuentas"
    )
    transfer_parser.add_argument(
        "--from",
        help="Cuenta origen (dirección o índice)",
        dest="src",
        type=address_or_index,
        required=True,
    )
    transfer_parser.add_argument(
        "--to",
        help="Cuenta destino (dirección o índice)",
        dest="dst",
        type=address_or_index,
        required=True,
    )
    transfer_parser.add_argument(
        "--amount", help="Cantidad a transferir", type=float, required=True
    )
    transfer_parser.add_argument(
        "--unit",
        help="Unidades del monto",
        choices=["wei", "Kwei", "Mwei", "Gwei", "microether", "milliether", "ether"],
        default=DEFAULT_UNIT,
    )
    transfer_parser.add_argument(
        "-p",
        "--password",
        help="Contraseña para desbloquear la cuenta origen",
        required=True,
    )
    # Comando accounts (sin parámetros)
    create_subparser("accounts", help="Lista las cuentas disponibles en el nodo")

    # Manejo personalizado de la ayuda
    if len(sys.argv) == 1 or "-h" in sys.argv or "--help" in sys.argv:
        parser.print_help()

        print("\nAyuda detallada por comando:")
        for name, subparser in subparsers.choices.items():
            print(f"\nComando '{name}':")
            subparser.print_help()

        sys.exit(0)

    args = parser.parse_args()

    try:
        # Inicializar conexión con el nodo
        w3 = init_web3_connection(args.uri)

        # Ejecutar comando
        if args.command == "balance":
            balance(w3, args.account, args.unit)
        elif args.command == "transfer":
            transfer(w3, args.src, args.dst, args.amount, args.unit, args.password)
        elif args.command == "accounts":
            accounts(w3)
        else:
            print(f"Comando desconocido: {args.command}", file=sys.stderr)
            sys.exit(1)

    except ConnectionError as e:
        print(f"Error de conexión: {str(e)}", file=sys.stderr)
        print("\nSugerencias:")
        print(f"1. Verifica que el nodo esté corriendo")
        print(f"2. Confirma que la URI '{args.uri}' es correcta")
        print(f"3. Prueba especificando una URI diferente con --uri")
        sys.exit(1)
    except Exception as e:
        print(f"Error inesperado: {str(e)}", file=sys.stderr)
        sys.exit(1)
