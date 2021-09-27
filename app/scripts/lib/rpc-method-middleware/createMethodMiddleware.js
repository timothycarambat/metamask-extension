import { permissionRpcMethods } from '@metamask/snap-controllers';
import localHandlers from './handlers';

const allHandlers = [...localHandlers, ...permissionRpcMethods.handlers];

/**
 * Creates a json-rpc-engine middleware of RPC method implementations.
 *
 * Handlers consume functions that hook into the background, and only depend
 * on their signatures, not e.g. controller internals.
 *
 * @param {Record<string, unknown>} hooks - Required "hooks" into our
 * controllers.
 * @returns {(req: Object, res: Object, next: Function, end: Function) => void}
 */
export default function createMethodMiddleware(hooks) {
  const handlerMap = getRpcMethodHandlerMap(allHandlers);
  return function methodMiddleware(req, res, next, end) {
    if (handlerMap.has(req.method)) {
      return handlerMap.get(req.method)(req, res, next, end, hooks);
    }
    return next();
  };
}

function getRpcMethodHandlerMap(handlers) {
  return handlers.reduce((map, handler) => {
    for (const methodName of handler.methodNames) {
      map.set(methodName, handler.implementation);
    }
    return map;
  }, new Map());
}
