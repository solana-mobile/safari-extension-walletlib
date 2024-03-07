# Safari Extension Walletlib

## About

A two part SDK that facilitates a simple Wallet [JSON RPC 2.0](https://www.jsonrpc.org/specification) spec for Javascript to Swift communication within a Safari Web Extension for iOS. The SDK is comprised two separate libraries: a Javascript library and a Swift library. The library is designed to be extendable and allow wallets to add their own customized RPC methods.

## Installation

The consumer of this SDK will need to install both the Javascript NPM package and the Swift podfile. Although optional, these two
libraries conveniently share the same RPC spec.

### 1. Install JS library

In the Javascript project of your Safari Extension, run:

```bash
npm install @solana-mobile/safari-extension-walletlib-js
```

### 2. Install Swift Cocoapod

In the Swift Safari Extension target of your Podfile add:

```ruby
  pod 'safari-extension-walletlib-swift'
```

## RPC methods

The SDK provides an implementation of two initial Wallet RPC requests for convenience:

- _GetAccounts_
- _SignPayloads_

Using them is optional and the wallet can create their own custom RPC requests using `sendNativeRpcRequest`, explained in the next section.

These RPC methods are defined by a JSON Serializable Parameter and Result type. The JS and Swift side should define
these Parameter and Result types equivalently.

### GetAccounts

This request instructs the Swift handler to return the accounts (or public key) associated with the requesting user.

- [Javascript model](https://github.com/solana-mobile/safari-extension-walletlib/blob/main/safari-extension-walletlib-js/src/nativeRpc/nativeGetAccounts.ts)

- [Swift model](https://github.com/solana-mobile/safari-extension-walletlib/blob/main/safari-extension-walletlib-swift/safari-extension-walletlib-swift/Classes/RpcRequestModels/GetAccounts.swift)

- Convenience JS function: `sendNativeGetAccountsRequest`, for sending _GetAccounts_ request and parsing the response.

### SignPayloads

This request instructs the Swift handler to sign the `payloads` with the private key that corresponds to the provided `address`.

- [Javascript model](https://github.com/solana-mobile/safari-extension-walletlib/blob/main/safari-extension-walletlib-js/src/nativeRpc/nativeSignPayloads.ts)

- [Swift model](https://github.com/solana-mobile/safari-extension-walletlib/blob/main/safari-extension-walletlib-swift/safari-extension-walletlib-swift/Classes/RpcRequestModels/SignPayloads.swift)

- Convenience JS function: `sendNativeSignPayloadsRequest`, for sending _SignPayloads_ request and parsing the response.

## Usage: Javascript

The Javascript library exposes methods for sending RPC requests to the Swift Extension handler.

Example: Request Sign Paylaods
Use the convenience function `sendNativeSignPayloadsRequest` to send a _SignPayloads_ request and receive
a parsed result.

```ts
import {
  sendNativeSignPayloadsRequest,
  NativeSignPayloadsResult,
} from "safari-extension-walletlib";

try {
  const result: NativeSignPayloadsResult = await sendNativeSignPayloadsRequest({
    address: someBase64EncodedAddress,
    payloads: [someBase64EncodedPayload],
  });
  console.log(result.signed_payloads);
} catch (err) {
  console.error(err.message);
}
```

## Usage: Swift

The Swift library provides extension methods on the `NSExtensionContext` to parse these RPC requests and respond back to the Javascript side.

### Request Parsing

`requestMethod() -> String?`

- Returns the RPC request method name. Returns `nil` if unable to parse.

`decodeRpcRequestParameter<T: Decodable>(toType type: T.Type) -> T?`

- Decodes JSON string parameters from the RPC request into a specified `Decodable` type `T`. Returns an instance of `nil` on failure.

`requestId() -> String?`

- Returns the id of the request.

### Request completion

`completeRpcRequestWith(result: Encodable)`

- Completes an RPC request with a success result. Encodes the result to JSON and responds to Javascript. On failure to encode, it completes the request with an error.

`completeRpcRequestWith(error: RPCError)`

- Completes an RPC request with a convenience `RpcError` class that follows the [JSON RPC 2.0 error spec](https://www.jsonrpc.org/specification).

`completeRpcRequestWith(errorCode: Int, errorMessage: String)`

- Completes an RPC request with an error that follows the [JSON RPC 2.0 error spec](https://www.jsonrpc.org/specification).

### Errors

The Swift library provides a WalletLibRpcErrors enum class that defines some convenience JSON RPC errors:

```swift
public class WalletlibRpcErrors {
    public static let parseError = RPCError(code: -32700, message: "Parse error")
    public static let invalidRequest = RPCError(code: -32600, message: "Invalid Request")
    public static let methodNotFound = RPCError(code: -32601, message: "Method not found")
    public static let invalidParams = RPCError(code: -32602, message: "Invalid params")
    public static let internalError = RPCError(code: -32603, message: "Internal error")
    public static let notSigned = RPCError(code: -3, message: "Payload not signed")
}
```

### Example: Handling requests

The wallet can use these methods in the `beginRequest` in its `SafariWebExtensionHandler` to handle incoming requests.

```swift
import SafariExtensionWalletlibSwift

func beginRequest(with context: NSExtensionContext) {
  // Parse the method identifier from `context`
  guard let method = context.requestMethod() else {
      context.completeRpcRequestWith(error: WalletlibRpcErrors.methodNotFound)
      return
  }

  switch method {
  case GET_ACCOUNTS_REQUEST_METHOD:
    context.completeRpcRequestWith(result: GetAccountsResult(addresses: ["encoded_address"]))
    return
  case SIGN_PAYLOADS_REQUEST_METHOD:
    // Decode SignPayloads params
    guard let params: SignPayloadsParams = context.decodeRpcRequestParameter(toType: SignPayloadsParams.self),
      !params.payloads.isEmpty else {
      context.completeRpcRequestWith(error: WalletlibRpcErrors.notSigned)
      return
    }
    // Implement signing then complete the request with result
    context.completeRpcRequestWith(result: SignPayloadsResult(signed_payloads: ["<encoded_signed_payload>"]))
    return
  default:
    context.completeRpcRequestWith(error: WalletlibRpcErrors.methodNotFound)
    return
  }
}
```

## Adding custom RPC requests

In addition to _GetAccounts_ and _SignPayloads_, a wallet might need more customized RPC requests.

If so, the wallet can add new RPC requests by defining JSON serializable _Parameter_ and _Result_ data models that are equivalent
in Javascript and Swift.

### Define the request model in Javascript

Define a method identifier, parameters, and a result type. Ensure that these types are JSON serializable.

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

Optionally, you can include an `id` parameter, but if not provided the library will generate a random `id` to comply with the JSON RPC 2.0 spec.

### Respond to the request

In the Swift Extension Handler, the wallet can filter and parse this custom RPC request, then handle accordingly.

```swift
func beginRequest(with context: NSExtensionContext) {
  guard let method = context.requestMethod() else {
      context.completeRpcRequestWith(error: WalletlibRpcErrors.methodNotFound)
      return
  }

  switch method {
  case MY_CUSTOM_RPC_METHOD:
      context.completeRpcRequestWith(result: MyCustomPingRequestResult(pong: "pong!"))
  default:
      context.completeRpcRequestWith(error: WalletlibRpcErrors.methodNotFound)
  }
}
```
