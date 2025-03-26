const circomlib = require("circomlibjs");
const { Scalar } = require("ffjavascript");
const fs = require("fs");

(async () => {
    // 1. Poseidon 해시 함수 초기화
    const poseidon = await circomlib.buildPoseidon();
    const F = poseidon.F;

    // 2. 입력 값 설정 (숫자형 또는 BigInt)
    const sk_user = BigInt("123456789");
    const deviceId = BigInt("987654321");
    const commandHash = BigInt("444444444");
    const nonce = BigInt("111");

    // 3. authNullifier = Poseidon(sk_user, deviceId)
    const authNullifier = poseidon([sk_user, deviceId]);
    const authNullifierHex = F.toString(authNullifier);

    // 4. cmdNullifier = Poseidon(authNullifier, commandHash, nonce)
    const cmdNullifier = poseidon([authNullifier, commandHash, nonce]);
    const cmdNullifierHex = F.toString(cmdNullifier);

    // 5. input.json 생성
    const input = {
        sk_user: sk_user.toString(),
        nonce: nonce.toString(),
        deviceId: deviceId.toString(),
        commandHash: commandHash.toString(),
        predictedAuthNullifier: authNullifierHex,
        predictedCmdNullifier: cmdNullifierHex
    };

    fs.writeFileSync("input.json", JSON.stringify(input, null, 2));
    console.log("✅ input.json 생성 완료!");
})();

