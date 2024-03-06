import { v4 } from 'uuid';
import { sendNativeRpcRequest } from './sendNativeRpcRequest';
import {
  Base64EncodedAddress,
  Base64EncodedPayload,
  Base64EncodedSignedPayload,
  NativeRpcResponse,
} from './types';

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
    const resultObj = JSON.parse(nativeResponse.result);
    if (isValidSignPayloadsResult(resultObj)) {
      return resultObj;
    } else {
      throw new Error(
        'Response does not match the NativeSignPayloadsResult structure.'
      );
    }
  } else {
    throw new Error(nativeResponse.error?.message ?? 'Invalid RPC Response');
  }
}
