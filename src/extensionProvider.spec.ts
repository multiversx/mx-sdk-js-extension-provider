import { Address } from "@multiversx/sdk-core/out/core/address";
import { Message } from "@multiversx/sdk-core/out/core/message";
import { Transaction } from "@multiversx/sdk-core/out/core/transaction";
import { ExtensionProvider } from "./extensionProvider";

const ADDRESS =
  "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th";
const OTHER_ADDRESS =
  "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx";

type MessageListener = (event: MessageEvent) => void;

const getListeners = (spy: jest.SpyInstance): MessageListener[] =>
  spy.mock.calls
    .filter(([type]) => type === "message")
    .map(([, listener]) => listener as MessageListener);

const getLastRequest = (spy: jest.SpyInstance) => {
  const calls = spy.mock.calls;
  return calls[calls.length - 1][0];
};

const createEvent = ({
  data,
  source = window as unknown as MessageEventSource,
  origin = window.location.origin,
  isTrusted = true,
}: {
  data: unknown;
  source?: MessageEventSource | null;
  origin?: string;
  isTrusted?: boolean;
}) => ({ data, source, origin, isTrusted } as unknown as MessageEvent);

const reply = (event: MessageEvent, spy: jest.SpyInstance) =>
  getListeners(spy).forEach((listener) => listener(event));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const createTransaction = (value: bigint) =>
  new Transaction({
    sender: Address.newFromBech32(ADDRESS),
    receiver: Address.newFromBech32(ADDRESS),
    gasLimit: BigInt(50_000),
    chainID: "D",
    value,
  });

describe("ExtensionProvider replies", () => {
  const provider = ExtensionProvider.getInstance();
  let addListenerSpy: jest.SpyInstance;
  let postMessageSpy: jest.SpyInstance;

  beforeEach(async () => {
    window.multiversxWallet = { extensionId: "test" };
    await provider.init();
    provider.setAccount({ address: "" });

    addListenerSpy = jest.spyOn(window, "addEventListener");
    postMessageSpy = jest
      .spyOn(window, "postMessage")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const startLogin = () => {
    let result: unknown = "pending";
    provider.login({ token: "token" }).then((value) => {
      result = value;
    });
    return () => result;
  };

  it.each([
    [
      "another window",
      { source: {} as MessageEventSource, origin: window.location.origin },
    ],
    ["a missing source", { source: null, origin: window.location.origin }],
    ["another origin", { origin: "https://other.example" }],
    ["an untrusted event", { isTrusted: false }],
  ])("ignores a connect reply from %s", async (_, overrides) => {
    const getResult = startLogin();

    reply(
      createEvent({
        data: {
          target: "erdw-contentScript",
          type: "connectResponse",
          data: { address: OTHER_ADDRESS, signature: "aa" },
        },
        ...overrides,
      }),
      addListenerSpy
    );
    await flush();

    expect(getResult()).toBe("pending");
    expect(provider.getAccount()?.address).toBe("");
  });

  it("accepts a connect reply from the content script", async () => {
    const getResult = startLogin();
    const { requestId } = getLastRequest(postMessageSpy);

    reply(
      createEvent({
        data: {
          target: "erdw-contentScript",
          type: "connectResponse",
          requestId,
          data: { address: ADDRESS, signature: "aa" },
        },
      }),
      addListenerSpy
    );
    await flush();

    expect(getResult()).toEqual({ address: ADDRESS, signature: "aa" });
    expect(provider.getAccount()?.address).toBe(ADDRESS);
  });

  it("sends a request id and ignores a reply to another request", async () => {
    const getResult = startLogin();
    const request = getLastRequest(postMessageSpy);

    expect(request).toEqual(
      expect.objectContaining({
        target: "erdw-inpage",
        type: "connect",
        requestId: expect.stringMatching(/^[0-9a-f]{32}$/),
      })
    );

    reply(
      createEvent({
        data: {
          target: "erdw-contentScript",
          type: "connectResponse",
          requestId: "0".repeat(32),
          data: { address: OTHER_ADDRESS },
        },
      }),
      addListenerSpy
    );
    await flush();

    expect(getResult()).toBe("pending");
  });

  it("does not take the account from a reply to another operation", async () => {
    const getResult = startLogin();

    reply(
      createEvent({
        data: {
          target: "erdw-contentScript",
          type: "",
          data: { address: OTHER_ADDRESS },
        },
      }),
      addListenerSpy
    );
    await flush();

    expect(getResult()).toBe("pending");
    expect(provider.getAccount()?.address).toBe("");
  });

  describe("when connected", () => {
    beforeEach(() => {
      provider.setAccount({ address: ADDRESS });
    });

    it("ignores signed transactions from another window", async () => {
      let signed: Transaction[] | null = null;
      provider
        .signTransactions([createTransaction(BigInt(1))])
        .then((value) => {
          signed = value;
        });

      reply(
        createEvent({
          source: {} as MessageEventSource,
          data: {
            target: "erdw-contentScript",
            type: "",
            data: [createTransaction(BigInt(999)).toPlainObject()],
          },
        }),
        addListenerSpy
      );
      await flush();

      expect(signed).toBeNull();
    });

    it.each([
      ["a typed reply", "signTransactionsResponse"],
      ["a reply from an earlier extension version", ""],
    ])("accepts signed transactions sent as %s", async (_, type) => {
      const transaction = createTransaction(BigInt(1));
      const promise = provider.signTransactions([transaction]);

      reply(
        createEvent({
          data: {
            target: "erdw-contentScript",
            type,
            data: [transaction.toPlainObject()],
          },
        }),
        addListenerSpy
      );

      const [signed] = await promise;
      expect(signed.value).toBe(BigInt(1));
    });

    it("ignores a reply typed for another operation", async () => {
      let signature: Message | null = null;
      provider
        .signMessage(new Message({ data: Buffer.from("hello") }))
        .then((value) => {
          signature = value;
        });

      reply(
        createEvent({
          data: {
            target: "erdw-contentScript",
            type: "signTransactionsResponse",
            data: { signature: "dead" },
          },
        }),
        addListenerSpy
      );
      await flush();

      expect(signature).toBeNull();
    });
  });
});
