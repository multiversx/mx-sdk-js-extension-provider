# Elrond SDK for JavaScript: Maiar DeFi Wallet provider

Signing provider for dApps: Maiar DeFi Wallet. 

An integration sample can be found further down in the README. However, for all purposes, **we recommend using [dapp-core](https://github.com/ElrondNetwork/dapp-core)** instead of integrating the signing provider on your own.

## Distribution

[npm](https://www.npmjs.com/package/@elrondnetwork/erdjs-extension-provider)

## Installation

`erdjs-extension-provider` is delivered via [npm](https://www.npmjs.com/package/@elrondnetwork/erdjs-extension-provider), therefore it can be installed as follows:

```
npm install @elrondnetwork/erdjs-extension-provider
```

### Building the library

In order to compile the library, run the following:

```
npm install
npm run compile
```

###Usage example

####Login
```
export async function login() {
let provider = ExtensionProvider.getInstance();
await provider.init();
let address = await provider.login();
    alert(`Address: ${address}`);
}
```

####Sign Transactions

```
export async function signTransactions() {
let provider = ExtensionProvider.getInstance();

    let firstTransaction = new DummyTransaction({
        nonce: 42,
        value: "1",
        receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
        gasPrice: 1000000000,
        gasLimit: 50000,
        data: "",
        chainID: "T",
        version: 1
    });

    let secondTransaction = new DummyTransaction({
        nonce: 43,
        value: "100000000",
        receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
        gasPrice: 1000000000,
        gasLimit: 50000,
        data: "hello world",
        chainID: "T",
        version: 1
    });

    await provider.signTransactions([firstTransaction, secondTransaction]);
    console.log("First transaction, upon signing:");
    console.log(firstTransaction);
    console.log("Second transaction, upon signing:");
    console.log(secondTransaction);

    alert(`Signatures: [${firstTransaction.signature}, ${secondTransaction.signature}]`);
}
```

#### Sign Messages

```
export async function signMessages() {
let provider = ExtensionProvider.getInstance();

    let message = new DummyMessage({
        message: Buffer.from("hello")
    });

    await provider.signMessage(message);
    console.log("Message, upon signing:");
    console.log(message);

    alert(`Signature: ${message.signature}`);
}
```