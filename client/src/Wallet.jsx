import server from "./server"

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
  signature,
  setSignature,
  isUsingPrivateKey,
  setIsUsingPrivateKey,
}) {
  async function onChange(evt) {
    const address = evt.target.value
    setAddress(address)
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`)
      setBalance(balance)
    } else {
      setBalance(0)
    }
  }

  async function onPrivateKeyChange(evt) {
    const privateKey = evt.target.value
    setPrivateKey(privateKey)
  }

  async function onSignatureChange(evt) {
    const signature = evt.target.value
    setSignature(signature)
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input
          placeholder="Type an address, for example: 0x1"
          value={address}
          onChange={onChange}
        ></input>
      </label>

      {/* // Create a button to toggle between using the private key or signature */}
      <button onClick={() => setIsUsingPrivateKey(!isUsingPrivateKey)}>
        {isUsingPrivateKey ? "Use Signature" : "Use Private Key"}
      </button>

      {/* // If we are using the private key, show the private key input */}
      {isUsingPrivateKey && (
        <label>
          Private Key
          <input
            placeholder="Type a private key"
            value={privateKey}
            onChange={onPrivateKeyChange}
          ></input>
        </label>
      )}

      {/* // If we are using the signature, show the signature input */}
      {!isUsingPrivateKey && (
        <label>
          Signature
          <input
            placeholder="Type a signature"
            value={signature}
            onChange={onSignatureChange}
          ></input>
        </label>
      )}

      <div className="balance">Balance: {balance}</div>
    </div>
  )
}

export default Wallet
