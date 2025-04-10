from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import json
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv()

RPC_URL = os.getenv('RPC_URL')
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
PORT = int(os.getenv('PORT', 12345))

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)

with open("contract_abi.json", "r") as abi_file:
    contract_abi = json.load(abi_file)

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=contract_abi
)

@app.route('/verifyProof', methods=['POST'])
def verify_proof():
    try:
        print("Received request at /verifyProof")
        data = request.get_json()

        if 'zkProof' not in data or 'publicSignals' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing zkProof or publicSignals'
            }), 400

        zk = data['zkProof']
        public_signals = data['publicSignals']  # should be 6 elements

        if len(public_signals) != 6:
            return jsonify({
                'success': False,
                'message': 'publicSignals must be length 6'
            }), 400
        print(public_signals)

        # Convert string inputs to integers
        pA = [int(zk['pi_a'][0]), int(zk['pi_a'][1])]
        pB = [
            [int(zk['pi_b'][0][1]), int(zk['pi_b'][0][0])],
            [int(zk['pi_b'][1][1]), int(zk['pi_b'][1][0])]
        ]
        pC = [int(zk['pi_c'][0]), int(zk['pi_c'][1])]
        pubSignals = list(map(int, public_signals))

        nonce = w3.eth.get_transaction_count(account.address)

        tx = contract.functions.verify(pA, pB, pC, pubSignals).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 500000,
            'gasPrice': w3.to_wei('2', 'gwei')
        })

        signed_tx = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return jsonify({
            'success': receipt['status'],
            'txHash': '0x'+str(tx_hash.hex())
        })

    except Exception as e:
        print("Error in verifyProof:", str(e))
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    CORS()
    app.run(host='0.0.0.0', port=PORT)
