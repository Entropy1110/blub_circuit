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

    // 3. encrypted_command.bin 파일에서 encryptedCmd 읽기
    const encryptedCmdBin = fs.readFileSync("./gen_cmd/encrypted_command.bin");
    // Buffer를 hex 문자열로 변환
    const hexString = encryptedCmdBin.toString("hex");

    // hex 문자열을 BigInt로 변환
    const encryptedCmd = BigInt("0x" + hexString);

    const encryptedCmdHash = poseidon([encryptedCmd]);
    const encryptedCmdHashHex = F.toString(encryptedCmdHash);


    // 4. authNullifier = Poseidon(sk_user, deviceId)
    const authNullifier = poseidon([sk_user, deviceId]);
    const authNullifierHex = F.toString(authNullifier);

    // 5. cmdNullifier = Poseidon(authNullifier, commandHash, nonce)
    const cmdNullifier = poseidon([authNullifier, encryptedCmdHash, nonce]);
    const cmdNullifierHex = F.toString(cmdNullifier);

    // 6. input.json 생성
    const input = {
        sk_user: sk_user.toString(),
        nonce: nonce.toString(),
        deviceId: deviceId.toString(),
        encryptedCmdHash: encryptedCmdHashHex,
        predictedAuthNullifier: authNullifierHex,
        predictedCmdNullifier: cmdNullifierHex
    };
    fs.mkdirSync("./gen_circuit_input", { recursive: true });
    fs.writeFileSync("./gen_circuit_input/input.json", JSON.stringify(input, null, 2));
    console.log("✅ ./gen_circuit_input/input.json 생성 완료!");
    console.log(encryptedCmdHashHex)
})();
