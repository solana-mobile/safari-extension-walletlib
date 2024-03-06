type JSONRPCErrorCode = number;

export class SafariExtensionWalletlibRpcError extends Error {
  code: JSONRPCErrorCode;
  jsonRpcId: string;
  constructor(
    ...args: [jsonRpcId: string, code: JSONRPCErrorCode, message: string]
  ) {
    const [jsonRpcId, code, message] = args;
    super(message);
    this.code = code;
    this.jsonRpcId = jsonRpcId;
    this.name = 'SafariExtensionWalletlibRpcError';
  }
}
