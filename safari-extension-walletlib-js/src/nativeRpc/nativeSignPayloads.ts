import { v4 } from 'uuid';
import { sendNativeRpcRequest } from './sendNativeRpcRequest';
import {
  Base64EncodedAddress,
  Base64EncodedPayload,
  Base64EncodedSignedPayload,
  NativeRpcResponse,
} from './types';
import { SafariExtensionWalletlibRpcError } from './errors';

/* Sign Payloads */
export type NativeSignPayloadsParams = {
  address: Base64EncodedAddress;
  payloads: Base64EncodedPayload[];
};

export type NativeSignPayloadsResult = {
  signed_payloads: Base64EncodedSignedPayload[];
};

// Basic JSON schema validation
function isValidSignPayloadsResult(
  resultObj: any
): resultObj is NativeSignPayloadsResult {
  return (
    Array.isArray(resultObj.signed_payloads) &&
    resultObj.signed_payloads.every(
      (payload: any) => typeof payload === 'string'
    )
  );
}

export const NATIVE_SIGN_PAYLOADS_RPC_METHOD = 'NATIVE_SIGN_PAYLOADS_METHOD';

export async function sendNativeSignPayloadsRequest({
  address,
  payloads,
  id = v4(),
}: NativeSignPayloadsParams & {
  id?: string;
}): Promise<NativeSignPayloadsResult> {
  const nativeResponse: NativeRpcResponse = await sendNativeRpcRequest({
    method: NATIVE_SIGN_PAYLOADS_RPC_METHOD,
    params: JSON.stringify({
      address,
      payloads,
    }),
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
