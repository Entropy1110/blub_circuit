const forge = require("node-forge");
const circomlib = require("circomlibjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

(async () => {
  // ----- 0. 공개키 경로 인자 처리 -----
  const args = process.argv.slice(2);
  if (args.length < 1) {
    process.exit(1);
  }
  const publicKeyPath = args[0];

  // ----- 1. Command 생성 -----
  const command = {
    deviceId: "device_1234",
    action: "turn_on",
    value: 1,
    timestamp: Date.now()
  };

  const commandStr = JSON.stringify(command);

  // ----- 2. 공개키 로드 및 암호화 (RSA-OAEP) -----
  const publicKeyPem = fs.readFileSync(publicKeyPath, "utf8");
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const encrypted = publicKey.encrypt(commandStr, "RSA-OAEP");

  // ----- 3. commandHash 계산 (Poseidon) -----
  const poseidon = await circomlib.buildPoseidon();
  const F = poseidon.F;

  // 안전하게 하기 위해 keccak256 → BigInt → Poseidon에 1개 입력
  const hashBytes = crypto.createHash("sha256").update(commandStr).digest();
  const hashBigInt = BigInt('0x' + hashBytes.toString('hex'));
  const commandHash = poseidon([hashBigInt]);
  const commandHashStr = F.toString(commandHash);

  // ----- 4. 저장 -----
  fs.writeFileSync("./gen_cmd/command.json", JSON.stringify(command, null, 2));
  fs.writeFileSync("./gen_cmd/encrypted_command.bin", encrypted);
  fs.writeFileSync("./gen_cmd/commandHash.txt", commandHashStr);

  console.log("✅ command.json, commandHash.txt, encrypted_command.bin 생성 완료");
})();
