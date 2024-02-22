# Safari Extension Walletlib

> A two part SDK that facilitates a simple Wallet RPC scheme for Javascript to Swift communication within a Safari Web Extension for iOS. The SDK is comprised two separate libraries: a Javascript library and a Swift library. The library is designed to be extendable and allow wallets to add their own customized RPC methods.

## Installation

The consumer of this SDK will need to install both the Javascript NPM package and the Swift podfile. Although optional, these two
libraries conveniently share the same RPC spec.

In the Javascript project of your Safari Extension, run:

```
npm install <TODO: Publish npm package>
```

In the Swift Safari Extension target of your XCode project, run:

```
pod install <TODO: Publish Podfile>
```

## Provided RPC methods

The SDK provides an implementation of two initial Wallet RPC requests for convenience. These are optional and the wallet
can also create their own RPC requests by conforming to the interface, explained later.

### GetAccounts

This request instructs the Swift handler to return the accounts (or public key) associated with the requesting user.

```ts
type NativeGetAccountsParams = {
  extra_data?: Record<string, JSONObject>;
};

type NativeGetAccountsResult = {
  addresses: Base58EncodedAddress[];
};
```

### SignPayloads

This request instructs the Swift handler to sign the `payloads` with the private key that corresponds to the provided `address`.

```ts
type NativeSignPayloadsParams = {
  address: Base64EncodedAddress;
  payloads: Base64EncodedPayload[];
  extra_data?: Record<string, JSONObject>;
};

type NativeSignPayloadsResult = {
  signed_payloads: Base64EncodedSignedPayload[];
};
```

## Usage: Javascript

The Javascript library exposes methods for sending RPC requests to the Swift Extension handler.

In this example, the JS side uses the convenience function `sendNativeSignPayloadsRequest` to send a _SignPayloads_ request

```ts
import { fromUint8Array } from "js-base64";
import { sendNativeSignPayloadsRequest } from "safari-extension-walletlib";

const userPubkey = new Publickey();
const result: NativeSignPayloadsResult = await sendNativeSignPayloadsRequest({
  address: fromUint8Array(userPubkey.toBytes()),
  payloads: [fromUint8Array(payload)],
});
```

## Usage: Swift

The Swift library provides methods to parse these RPC requests and respond back to the Javascript side.

```

```

## Adding custom RPC requests

A wallet mmight need customized RPC requests, in addition to the two provided.

If so, the wallet can add new RPC requests by defining JSON serializable _Parameter_ and _Result_ types.

```ts
// 1. Define a method identifier
export const MY_CUSTOM_RPC_METHOD = "MY_CUSTOM_RPC_METHOD";

// 2. Define JSON serializable parameters of your request
type MyCustomRequestParams = {
  customParam1: string;
  customParam2: string[];
};

// 3. Define the expected JSON serializable result of your request.
type MyCustomRequestResult = {
  customResult: Record<string, string[]>;
};
```

Then, use the generic RPC sender function `sendNativeRpcRequest` to send the request to the Swift side.

```ts
const nativeResponse: NativeRpcResponse = await sendNativeRpcRequest({
  method: MY_CUSTOM_RPC_METHOD,
  params: {
    customParam1: "hello",
    customParam2: ["hello world"],
  },
});

// Unwrap the RpcResponse and attempt to parse
if (nativeResponse.result) {
  const resultObj: MyCustomRequestResult = JSON.parse(nativeResponse.result);
} else {
  console.error(nativeResponse.error);
}
```
