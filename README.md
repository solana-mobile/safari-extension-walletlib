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

## RPC methods

The SDK provides an implementation of two initial Wallet RPC requests for convenience : _GetAccounts_ and _SignPayloads_. Using them is optional and the wallet
can create their own custom RPC requests, explained in the next section.

These RPC methods are defined by a JSON Serializable Parameter and Result type. These types will are defined
equivalently in both the Javascript library and the Swift library.

### GetAccounts

This request instructs the Swift handler to return the accounts (or public key) associated with the requesting user.

Javascript:

```ts
type NativeGetAccountsParams = {
  extra_data?: Record<string, JSONObject>;
};

type NativeGetAccountsResult = {
  addresses: Base58EncodedAddress[];
};

export const NATIVE_GET_ACCOUNTS_RPC_METHOD = "NATIVE_GET_ACCOUNTS_METHOD";
```

Swift:

```swift
public struct GetAccountsParams: Decodable {
    public let extra_data: [String: String]?
}

public struct GetAccountsResult: Encodable {
    // Array of base58-encoded public keys
    public let addresses: [String]

    public init(addresses: [String]) {
        self.addresses = addresses
    }
}

public let GET_ACCOUNTS_REQUEST_METHOD = "NATIVE_GET_ACCOUNTS_METHOD"
```

### SignPayloads

This request instructs the Swift handler to sign the `payloads` with the private key that corresponds to the provided `address`.

Javascript:

```ts
type NativeSignPayloadsParams = {
  address: Base64EncodedAddress;
  payloads: Base64EncodedPayload[];
  extra_data?: Record<string, JSONObject>;
};

type NativeSignPayloadsResult = {
  signed_payloads: Base64EncodedSignedPayload[];
};

export const NATIVE_SIGN_PAYLOADS_RPC_METHOD = "NATIVE_SIGN_PAYLOADS_METHOD";
```

Swift:

```swift
public struct SignPayloadsParams: Decodable {
  public let address: String // Base64EncodedAddress
  public let payloads: [String] // Array of Base64EncodedPayloads
  public let extra_data: [String: String]?
}

public struct SignPayloadsResult: Encodable {
  // Array of Base64EncodedSignedPayloads
  public let signed_payloads: [String]

  public init(signed_payloads: [String]) {
      self.signed_payloads = signed_payloads
  }
}

public let SIGN_PAYLOADS_REQUEST_METHOD = "NATIVE_SIGN_PAYLOADS_METHOD"
```

## Usage: Javascript

The Javascript library exposes methods for sending RPC requests to the Swift Extension handler.

In this example, the JS side uses the convenience function `sendNativeSignPayloadsRequest` to send a _SignPayloads_ request

```ts
import { fromUint8Array } from "js-base64";
import { PublicKey } from "@solana/web3.js";
import { sendNativeSignPayloadsRequest } from "safari-extension-walletlib";

const userPubkey = new PublicKey(/* ... */);
const result: NativeSignPayloadsResult = await sendNativeSignPayloadsRequest({
  address: fromUint8Array(userPubkey.toBytes()),
  payloads: [fromUint8Array(payload)],
});
```

## Usage: Swift

The Swift library provides extension methods on the `NSExtensionContext` to parse these RPC requests and respond back to the Javascript side.

- `NSExtensionContext.completeRpcRequestWith(errorMessage: string)`

The wallet can use these methods in the `beginRequest` in its `SafariWebExtensionHandler` to handle incoming requests.

```swift
func beginRequest(with context: NSExtensionContext) {
  // Parse the method identifier from `context`
  guard let method = context.requestMethod() else {
      context.completeRpcRequestWith(errorMessage: "Error parsing method")
      return
  }

  switch method {
  case GET_ACCOUNTS_REQUEST_METHOD:
    /* Implementation of get accounts */
    context.completeRpcRequestWith(result: GetAccountsResult(addresses: ["encoded_address"]))
    return
  case SIGN_PAYLOADS_REQUEST_METHOD:
    /* Implementation of sign payloads */
    context.completeRpcRequestWith(result: SignPayloadsResult(signed_payloads: ["<encoded_signed_payload>"]))
    return
  default:
    context.completeRpcRequestWith(errorMessage: "Unsupported method")
    return
  }
}
```

## Adding custom RPC requests

In addition to _GetAccounts_ and _SignPayloads_, a wallet might need more customized RPC requests.

If so, the wallet can add new RPC requests by defining JSON serializable _Parameter_ and _Result_ data models that are equivalent
in Javascript and Swift.

### Define the request model in Javascript

Define a method identifier, parameters, and a result type. Ensure that these types are JSON serializable. The `JSONObject` helper type conforms to this.

```ts
// 1. Define a method identifier
export const MY_CUSTOM_PING_RPC_METHOD = "MY_CUSTOM_PING_RPC_METHOD";

// 2. Define JSON serializable parameters of your request
type MyCustomPingRequestParams = {
  pingParam1: string;
  pingParam2: string[];
};

// 3. Define the expected JSON serializable result of your request.
type MyCustomPingRequestResult = {
  pong: string;
};
```

### Define the request model in Swift

```swift
// 1. Define an equivalent method identifier
public let MY_CUSTOM_PING_RPC_METHOD = "MY_CUSTOM_PING_RPC_METHOD"

// 2. Define an equivalent parameters struct that conforms to `Decodable`
public struct MyCustomPingRequestParams: Decodable {
    let pingParam1: String
    let pingParam2: [String]
}

// 3. Define an equivalent result struct that conforms to `Encodable`
public struct MyCustomPingRequestResult: Encodable {
    let pong: String

    public init(pong: String) {
        self.pong = pong
    }
}
```

### Send the request

Then, use the generic RPC sender function `sendNativeRpcRequest` to send the request to the Swift side.

```ts
const nativeResponse: NativeRpcResponse = await sendNativeRpcRequest({
  method: MY_CUSTOM_RPC_METHOD,
  params: {
    customParam1: "ping",
    customParam2: ["ping"],
  },
});

// Unwrap the RpcResponse and attempt to parse
if (nativeResponse.result) {
  const resultObj: MyCustomPingRequestResult = JSON.parse(
    nativeResponse.result
  );
  console.log(resultObj.pong); // "pong!"
} else {
  console.error(nativeResponse.error);
}
```

### Respond to the request

In the Swift Extension Handler, the wallet can filter and parse this custom RPC request, then handle accordingly.

```swift
func beginRequest(with context: NSExtensionContext) {
  guard let method = context.requestMethod() else {
      context.completeRpcRequestWith(errorMessage: "Unsupported method")
      return
  }

  switch method {
  case MY_CUSTOM_RPC_METHOD:
      context.completeRpcRequestWith(result: MyCustomPingRequestResult(pong: "pong!"))
  default:
      context.completeRpcRequestWith(errorMessage: "Unsupported method")
  }
}
```
