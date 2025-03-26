`cd blub_circuit/build/main_js`

`node generate_input.js`
→ example input 생성

`node generate_witness.js main.wasm input.json witness.wtns`
→ example input으로 witness 생성

`snarkjs groth16 prove ../circuit.zkey witness.wtns proof.json public.json`
→ witness를 가지고 proof.json (증명 데이터), public.json (public input 값) 생성

`snarkjs groth16 verify ../verification_key.json public.json proof.json`
→ proof.json과 public.json을 가지고, 증명이 유효한지 verify

### ETC

1. main.circuit이 바뀌었을 때 zkey &  verification_key.json 생성 방법
- circuit 컴파일 후, r1cs 생성
`circom main.circom --r1cs --wasm --sym -o build`

- r1cs + pot14_final.ptau 이용해서 zkey 생성
`pot14_final`
`snarkjs groth16 setup build/main.r1cs ptau/pot14_final.ptau build/circuit_0000.zkey`

- zkey contribute
`snarkjs zkey contribute build/circuit_0000.zkey build/circuit.zkey --name="1st Contributor" -v`

- verification_key.json export
`snarkjs zkey export verificationkey ../build/circuit.zkey ../build/verification_key.json`

2. verifier.sol 생성 방법
    
    `snarkjs zkey export solidityverifier ../build/circuit.zkey ../build/verifier.sol`
    → `circuit.zkey`를 통해 `verifier.sol` 자동으로 생성
