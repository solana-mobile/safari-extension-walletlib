import { NativeRpcRequest, NativeRpcResponse } from './types';

export async function sendNativeRpcRequest({
  method,
  params,
  id,
}: NativeRpcRequest): Promise<NativeRpcResponse> {
  const request = {
    jsonrpc: '2.0',
    method: method,
    params,
    id,
  };

  try {
    return await browser.runtime.sendNativeMessage('_', request);
  } catch (error) {
    throw new Error('Error sending native message');
  }
}
