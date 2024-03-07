import { v4 } from 'uuid';
import { sendNativeRpcRequest } from './sendNativeRpcRequest';
import { Base58EncodedAddress, NativeRpcResponse } from './types';
import { SafariExtensionWalletlibRpcError } from './errors';

/* Get Accounts */
export type NativeGetAccountsResult = {
  addresses: Base58EncodedAddress[];
};

export const NATIVE_GET_ACCOUNTS_RPC_METHOD = 'NATIVE_GET_ACCOUNTS_METHOD';

export async function sendNativeGetAccountsRequest(
  id: string = v4()
): Promise<NativeGetAccountsResult> {
  const nativeResponse: NativeRpcResponse = await sendNativeRpcRequest({
    method: NATIVE_GET_ACCOUNTS_RPC_METHOD,
    params: null,
    id,
  });

  if (nativeResponse.error) {
    throw new SafariExtensionWalletlibRpcError(
      nativeResponse.id,
      nativeResponse.error.code,
      nativeResponse.error.message
    );
  }

  if (!nativeResponse?.result) {
    throw new Error('Received an unexpected response format.');
  }

  return JSON.parse(nativeResponse.result);
}
