# Elrond SDK for JavaScript: Maiar DeFi Wallet provider

Signing provider for dApps: Maiar DeFi Wallet. 

An integration sample can be found [here](examples/app.js). However, for all purposes, **we recommend using [dapp-core](https://github.com/ElrondNetwork/dapp-core)** instead of integrating the signing provider on your own.

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

### Running the examples

Make sure you have the package `http-server` installed globally.

```
npm install --global http-server
```

Furthermore, make sure you install the browser extension `Maiar DeFi Wallet` in advance.

When you are ready, build the examples:

```
npm run compile-examples
```

Start the server and navigate to `http://localhost:8080/examples/index.html`

```
http-server --port=8080
```
