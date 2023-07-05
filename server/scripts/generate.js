const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp256k1.utils.randomPrivateKey();
const publicKey = secp256k1.getPublicKey(privateKey);

function addressToPublicKeyLast20Bytes(address) {
    return Buffer.from(address.slice(2), "hex");
}

console.log("Private key:", toHex(privateKey));
console.log("Public key:", toHex(publicKey));

function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
}

function signMessage(message, privateKey) {

    // // You pass either a hex string, or Uint8Array
    // const privateKey = "6b911fd37cdf5c81d4c0adb1ab7fa822ed253ab0ad9aa18d77257c88b29b718e";
    // const messageHash = "a33321f98e4ff1c283c76998f14f57447545d339b3db534c6d886decb4209f28";
    // const publicKey = secp256k1.getPublicKey(privateKey);
    // const signature = secp256k1.sign(messageHash, privateKey);
    // const isSigned = secp256k1.verify(signature, messageHash, publicKey);
    const hash = hashMessage(message);
    const signature = secp256k1.sign(hash, privateKey);
    return signature;
}

function verifyMessage(message, signature, publicKey) {
    const hash = hashMessage(message);
    return secp256k1.verify(signature, hash, publicKey);
}

// OPTION 1
// sign message through script
// send message, signature, and public key to server
// server performs verification, and then executes the transaction

// OPTION 2
// give client the private key
// client signs message
// client sends message, signature, and public key to server
// server performs verification, and then executes the transaction

const templateObject = {
    "name": "My NFT",
    "description": "My NFT description",
    "image": "https://example.com/image.png",
};

const template = JSON.stringify(templateObject);
const signature = signMessage(template, privateKey);
const isSigned = verifyMessage(template, signature, publicKey);

console.log("Template:", template);
console.log("Signature:", signature);
console.log("Is signed:", isSigned);
