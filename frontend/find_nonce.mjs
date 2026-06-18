import { keccak256, encodePacked } from 'viem';

const challenge = "0x7052383892f7a5cae10959e953edbdf78693b388f2647755258b7f5f42d68b65";
const miner = "0x858E1C20D5013887E9D0417Dc1DDCfe283341C02";
const difficulty = 7237005577332262213973186563042994240829374041602535252466099000494570602495n;

let nonce = 0n;
while (true) {
    const hashHex = keccak256(encodePacked(['bytes32', 'address', 'uint256'], [challenge, miner, nonce]));
    const hashInt = BigInt(hashHex);
    if (hashInt <= difficulty) {
        console.log("Found nonce:", nonce.toString());
        console.log("Hash:", hashHex);
        break;
    }
    nonce++;
}
