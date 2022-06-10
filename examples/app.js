import { ExtensionProvider } from "../src";
import { Address } from "../src/primitives";
import { DummyMessage } from "./dummyMessage";
import { DummyTransaction } from "./dummyTransaction";

export async function login() {
    let provider = ExtensionProvider.getInstance();
    await provider.init();
    let address = await provider.login();

    alert(`Address: ${address}`);
}

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


