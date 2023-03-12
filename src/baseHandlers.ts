import { track, trigger } from './effect';

function get(target: object, key: string | symbol, receiver: object) {
  const res = Reflect.get(target, key, receiver);

  track(target, key);

  return res;
}

function set(
  target: object,
  key: string | symbol,
  value: unknown,
  receiver: object,
): boolean {
  const result = Reflect.set(target, key, value, receiver);
  trigger(target, key);
  return result;
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
};
