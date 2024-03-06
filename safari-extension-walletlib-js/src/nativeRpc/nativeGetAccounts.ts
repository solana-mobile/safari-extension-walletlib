import { v4 } from 'uuid';
import { sendNativeRpcRequest } from './sendNativeRpcRequest';
import { Base58EncodedAddress, NativeRpcResponse } from './types';
import { SafariExtensionWalletlibRpcError } from './errors';

/* Get Accounts */
export type NativeGetAccountsResult = {
  addresses: Base58EncodedAddress[];
};

export const NATIVE_GET_ACCOUNTS_RPC_METHOD = 'NATIVE_GET_ACCOUNTS_METHOD';

// Basic JSON schema validation
function isValidNativeGetAccountsResult(
  obj: any
): obj is NativeGetAccountsResult {
  return (
    Array.isArray(obj.addresses) &&
    obj.addresses.every((addr: any) => typeof addr === 'string')
  );
}

export async function sendNativeGetAccountsRequest({
  id = v4(),
}: {
  id?: string;
}): Promise<NativeGetAccountsResult> {
  const nativeResponse: NativeRpcResponse = await sendNativeRpcRequest({
    method: NATIVE_GET_ACCOUNTS_RPC_METHOD,
    params: null,
    id,
  });

  if (nativeResponse.result) {
    return JSON.parse(nativeResponse.result);
  } else if (nativeResponse.error) {
    throw new SafariExtensionWalletlibRpcError(
      nativeResponse.id,
      nativeResponse.error.code,
      nativeResponse.error.message
    );
  } else {
    throw new Error('Received an unexpected response format.');
  }
}
