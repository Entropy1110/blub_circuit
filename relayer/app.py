from flask import Flask, request, jsonify
from web3 import Web3
import json
import os

app = Flask(__name__)

RPC_URL = os.environ.get('RPC_URL', 'rpc url')
PRIVATE_KEY = os.environ.get('PRIVATE_KEY', 'private key')
CONTRACT_ADDRESS = os.environ.get('CONTRACT_ADDRESS', 'contract address')
PORT = int(os.environ.get('PORT', 5000))

w3 = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)

with open("contract_abi.json", "r") as abi_file:
    contract_abi = json.load(abi_file)

contract = w3.eth.contract(
    address=Web3.toChecksumAddress(CONTRACT_ADDRESS),
    abi=contract_abi
)

@app.route('/sendCommand', methods=['POST'])
def send_command():
    try:
        data = request.get_json()

        required_fields = [
            'deviceId',
            'encryptedCommand',
            'commandHash',
            'authNullifier',
            'cmdNullifier',
            'zkProof'
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing field: {field}'
                }), 400

        deviceId = data['deviceId']
        encryptedCommand = data['encryptedCommand']
        commandHash = data['commandHash']
        authNullifier = data['authNullifier']
        cmdNullifier = data['cmdNullifier']
        zkProof = data['zkProof'] 

        nonce = w3.eth.get_transaction_count(account.address)

        tx = contract.functions.sendCommand(
            deviceId,
            encryptedCommand,
            commandHash,
            authNullifier,
            cmdNullifier,
            zkProof
        ).buildTransaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 3000000,  
            'gasPrice': w3.toWei('50', 'gwei')
        })

        signed_tx = account.sign_transaction(tx)

        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return jsonify({
            'success': True,
            'receipt': dict(receipt)
        })

    except Exception as e:
        print("Error in sendCommand:", str(e))
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=PORT)

