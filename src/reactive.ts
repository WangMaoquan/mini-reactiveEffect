import { mutableHandlers } from './baseHandlers';

export const reactiveMap = new WeakMap<object, any>();

export function reactive<T extends object>(target: T): T;
export function reactive(target: object) {
  if (target !== null && typeof target !== 'object') {
    return target;
  }
  const existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
