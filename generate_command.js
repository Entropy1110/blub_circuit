const forge = require("node-forge");
const circomlib = require("circomlibjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

(async () => {

  // ----- 1. Command 생성 -----
  const command = {
    deviceId: "device_1234",
    action: "turn_on",
    value: 1,
    timestamp: Date.now()
  };

  const commandStr = JSON.stringify(command);

  // ----- 2. 공개키 로드 및 암호화 (RSA-OAEP) -----
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxhd30cRPntYN//7A81HX
lVquFko82LrBxPvtgz3tl4rYeX6hINOSqzhpjtwLwP8if41oU6MXeEBZYH+OD5sz
zUA//NFBKPcn77h856EzTwDyzFt4n6FLAqgCA4nasUbMUOYqV3nIwnFB/xg0AWzI
cI5mvqylTEBGtBR+8nkwiinOBUVUi6xopJgM29ra+A6+sfi2gdyKNYtKRrODXr/q
by+SRQ5tdsu5xGT0KwhBy8fjrXWL8JMnAeIl4/HEMbJu2lkUfCHk4cYi6ZnkJ9l6
5yCPP+Ohj07vNdVQGizHnMW34/0sP93UDtPswxrvFcIH86dNeRtijwVAHFhmWJOf
NQIDAQAB
-----END PUBLIC KEY-----`.trim();

  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const encrypted = publicKey.encrypt(commandStr, "RSA-OAEP");

  fs.mkdirSync("./gen_cmd", { recursive: true });
  fs.writeFileSync("./gen_cmd/command.json", JSON.stringify(command, null, 2));
  fs.writeFileSync("./gen_cmd/encrypted_command.bin", encrypted);

  console.log("✅ command.json, encrypted_command.bin 생성 완료");
})();
