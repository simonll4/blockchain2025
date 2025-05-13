from web3 import Web3, Account
import json

Account.enable_unaudited_hdwallet_features()


def load_config(path="config.json"):
    with open(path) as f:
        return json.load(f)


def get_account(mnemonic, index):
    path = f"m/44'/60'/0'/0/{index}"
    return Account.from_mnemonic(mnemonic, account_path=path)


def load_contract(w3, path):
    with open(path) as f:
        contract_data = json.load(f)
    abi = contract_data["abi"]
    address = Web3.to_checksum_address(contract_data["networks"]["5777"]["address"])
    return w3.eth.contract(address=address, abi=abi)
