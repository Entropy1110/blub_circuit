const circomlib = require("circomlibjs");
const fs = require("fs");
const path = require("path");

(async () => {
    // 1. Poseidon 해시 초기화
    const poseidon = await circomlib.buildPoseidon();
    const F = poseidon.F;

    // 2. 입력 값 설정
    const sk_user = BigInt("123456789");
    const deviceId = BigInt("987654321");
    const nonce = BigInt("111");

    // 3. commandHash.txt 파일에서 hash 값 읽기
    const commandHashStr = fs.readFileSync("./gen_cmd/encrypted_command.bin");
    const commandHash = BigInt(commandHashStr);

    // 4. authNullifier = Poseidon(sk_user, deviceId)
    const authNullifier = poseidon([sk_user, deviceId]);
    const authNullifierHex = F.toString(authNullifier);

    // 5. cmdNullifier = Poseidon(authNullifier, commandHash, nonce)
    const cmdNullifier = poseidon([authNullifier, commandHash, nonce]);
    const cmdNullifierHex = F.toString(cmdNullifier);

    // 6. input.json 생성
    const input = {
        sk_user: sk_user.toString(),
        nonce: nonce.toString(),
        deviceId: deviceId.toString(),
        commandHash: commandHash.toString(),
        predictedAuthNullifier: authNullifierHex,
        predictedCmdNullifier: cmdNullifierHex
    };

    fs.writeFileSync("./gen_circuit_input/input.json", JSON.stringify(input, null, 2));
    console.log("✅ ./gen_circuit_input/input.json 생성 완료!");
})();
