import assert from "assert";
import { ExtensionProvider } from "../out/extensionProvider";
import { Address } from "../out/primitives";
import { DummyMessage } from "./dummyMessage";
import { DummyTransaction } from "./dummyTransaction";

export async function login() {
    let provider = ExtensionProvider.getInstance();
    await provider.init();
    let address = await provider.login();
    console.log("Address:", address);
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

    let firstTransactionSigned = await provider.signTransaction(firstTransaction);

    assert(firstTransaction === firstTransactionSigned, "The extension provider should return the same object passed as input");
    console.log("First transaction, upon signing:");
    console.log(firstTransaction);
}

export async function signMessages() {
    let provider = ExtensionProvider.getInstance();

    let message = new DummyMessage({
        message: Buffer.from("hello")
    });
    let messageSigned = await provider.signMessage(message);

    assert(message === messageSigned, "The extension provider should return the same object passed as input");
    console.log("Message, upon signing:");
    console.log(messageSigned);
}


