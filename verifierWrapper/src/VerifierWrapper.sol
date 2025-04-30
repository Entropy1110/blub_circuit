// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {Groth16Verifier} from "./verifier.sol";
contract VerifierWrapper {

    event VerifyLog(uint[2] _pA, uint[2][2] _pB, uint[2] _pC, uint[6] _pubSignals, bytes _encryptedCmd);
    mapping(uint=>bool) private cmdUsed; // prevent cmdNullifier reuse

    Groth16Verifier public verifier;

    constructor (Groth16Verifier _verifier) {
        verifier = _verifier;

    }

    function verify(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[6] calldata _pubSignals, bytes calldata _encryptedCmd) public {
        require(!cmdUsed[_pubSignals[5]], "Cannot use cmdNullifier more than once");
        cmdUsed[_pubSignals[5]] = true;
        
        bool result = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        require(result);

        emit VerifyLog(_pA, _pB, _pC, _pubSignals, _encryptedCmd);
    }

}
