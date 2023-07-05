const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
// cryptography imports
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "022b910a570d92e4700ed9d99d6df787c3bc274bb832a18f6a97564a1131e7b544": 100,
  "027b49fa0c6fbabac5be4ca5bd70ef7aa8cef844365e10657b1d712f63a75ac455": 50,
  "037e4d7a48ab9cc4f64fd27eb9b0dfec4920921d45c1e8b0ca196caa1e872b14d2": 75,
};

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function verifyMessage(message, signature, publicKey) {
  try {
    const hash = hashMessage(message);
    const signatureFromHex = secp256k1.Signature.fromCompact(signature);
    return secp256k1.verify(signatureFromHex, hash, publicKey);
  } catch (error) {
    console.log("Error verifying message:", error);
    return false;
  }
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signatureHex, message } = req.body;

  const transaction = JSON.parse(message);

  const {
    sender,
    amount,
    recipient,
  } = transaction;

  const isSigned = verifyMessage(message, signatureHex, sender);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (!isSigned) {
    res.status(400).send({ message: "Invalid signature!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  }
  else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
