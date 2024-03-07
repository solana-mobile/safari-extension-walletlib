export type Base64EncodedAddress = string;
export type Base64EncodedTransaction = string;
export type Base64EncodedMessage = string;
export type Base58EncodedAddress = string;
export type Base64EncodedPayload = string;
export type Base64EncodedSignedPayload = string;

// JSON-RPC Request
export interface NativeRpcRequest {
  method: string;
  params: string | null;
  id: string;
}

export interface NativeRpcResponse {
  result?: string;
  error?: {
    code: number;
    message: string;
  };
  id: string;
}
