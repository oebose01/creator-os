import os
from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

load_dotenv()

# Only initialize if ETHEREUM_PRIVATE_KEY is present
ETH_PRIVATE_KEY = os.getenv("ETHEREUM_PRIVATE_KEY")
ETH_RPC_URL = os.getenv("ETHEREUM_RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# Global variables to hold contract and account if available
w3 = None
contract = None
account = None

if ETH_PRIVATE_KEY and ETH_RPC_URL and CONTRACT_ADDRESS:
    try:
        # Connect to Ethereum network
        w3 = Web3(Web3.HTTPProvider(ETH_RPC_URL))
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)  # for Sepolia

        # Contract ABI (compiled from ContentRegistry.sol)
        CONTRACT_ABI = [
            {
                "inputs": [
                    {"internalType": "string", "name": "contentHash", "type": "string"}
                ],
                "name": "register",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function",
            },
            {
                "inputs": [
                    {"internalType": "string", "name": "contentHash", "type": "string"}
                ],
                "name": "verify",
                "outputs": [
                    {"internalType": "address", "name": "owner", "type": "address"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                ],
                "stateMutability": "view",
                "type": "function",
            },
        ]

        account = w3.eth.account.from_key(ETH_PRIVATE_KEY)
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        print("Ethereum integration enabled")
    except Exception as e:
        print(f"Failed to initialize Ethereum: {e}")
        # Reset variables to None
        w3 = None
        contract = None
        account = None


def register_content_on_chain(content_hash: str) -> dict:
    """Register content hash on blockchain if available, otherwise return None."""
    if not contract or not account:
        return None
    try:
        txn = contract.functions.register(content_hash).build_transaction(
            {
                "from": account.address,
                "nonce": w3.eth.get_transaction_count(account.address),
                "gas": 200000,
                "gasPrice": w3.eth.gas_price,
            }
        )
        signed_txn = account.sign_transaction(txn)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return {"tx_hash": tx_hash.hex(), "block_number": receipt["blockNumber"]}
    except Exception as e:
        print(f"Blockchain registration error: {e}")
        return None


def verify_content_on_chain(content_hash: str) -> dict:
    """Verify content hash on blockchain if available."""
    if not contract:
        return {"exists": False}
    try:
        owner, timestamp = contract.functions.verify(content_hash).call()
        return {
            "owner": owner,
            "timestamp": timestamp,
            "exists": owner != "0x0000000000000000000000000000000000000000",
        }
    except Exception as e:
        print(f"Blockchain verification error: {e}")
        return {"exists": False}
