import { useState } from "react"
import server from "./server"
import { secp256k1 } from "ethereum-cryptography/secp256k1"
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils"
import { keccak256 } from "ethereum-cryptography/keccak"

function hashMessage(message) {
  return keccak256(utf8ToBytes(message))
}

function signMessage(message, privateKey) {
  const hash = hashMessage(message)
  let privateKeyHex = toHex(privateKey)
  const signature = secp256k1.sign(hash, privateKeyHex)
  return signature
}

function Transfer({
  address,
  setBalance,
  privateKey,
  signature,
  isUsingPrivateKey,
}) {
  const [sendAmount, setSendAmount] = useState("")
  const [recipient, setRecipient] = useState("")

  const setValue = (setter) => (evt) => setter(evt.target.value)

  async function transfer(evt) {
    evt.preventDefault()

    try {
      let signatureLocal
      const message = JSON.stringify({
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      })
      if (isUsingPrivateKey) {
        console.log("Signing message with private key", privateKey)
        try {
          console.log("Message to sign", message)
          signatureLocal = signMessage(message, privateKey)
        } catch (error) {
          console.error("Error signing message", error)
        }
      } else if (typeof signature === "string" && signature.length > 0) {
        console.log("Using signature", signature)
        try {
          signatureLocal = JSON.parse(signature)
        } catch (error) {
          console.error("Error parsing signature", error)
        }
      }
      console.log("Signature Local", signatureLocal)

      console.log("Converting signature to bytes")
      // let signatureBytes
      let signatureHex
      try {
        if (typeof signature === "string" && signature.length > 0) {
          signatureHex = signature
        } else {
          signatureHex = signatureLocal.toCompactHex()
        }
      } catch (error) {
        console.error("Error converting signature to bytes", error)
      }

      console.log("Sending transaction")
      const {
        data: { balance },
      } = await server.post(`send`, {
        signatureHex,
        message,
      })
      setBalance(balance)
    } catch (ex) {
      console.error("Error sending transaction", ex)
      alert(ex?.response?.data?.message)
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  )
}

export default Transfer
