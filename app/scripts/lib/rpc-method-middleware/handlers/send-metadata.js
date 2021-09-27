import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

/**
 * TODO: Description
 */

const sendMetadata = {
  methodNames: [MESSAGE_TYPE.SEND_METADATA],
  implementation: sendMetadataHandler,
};
export default sendMetadata;

/**
 * @typedef {Record<string, Function>} SendMetadataOptions
 * @property {Function} addSubjectMetadata - A function that records subject metadata.
 */

/**
 * @param {import('json-rpc-engine').JsonRpcRequest<unknown>} req - The JSON-RPC request object.
 * @param {import('json-rpc-engine').JsonRpcResponse<true>} res - The JSON-RPC response object.
 * @param {Function} _next - The json-rpc-engine 'next' callback.
 * @param {Function} end - The json-rpc-engine 'end' callback.
 * @param {SendMetadataOptions} options
 */
function sendMetadataHandler(req, res, _next, end, { addSubjectMetadata }) {
  if (typeof req.params?.name === 'string') {
    addSubjectMetadata(req.params);
  }

  res.result = true;
  return end();
}
