type Dep = Set<ReactiveEffect>;
type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export let activeEffect: ReactiveEffect | undefined;

class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}
  run() {
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = undefined;
    }
  }
}

export interface ReactiveEffectRunner<T = any> {
  (): T;
  effect: ReactiveEffect;
}

export function effect<T = any>(fn: () => T): ReactiveEffectRunner {
  if ((fn as ReactiveEffectRunner).effect) {
    fn = (fn as ReactiveEffectRunner).effect.fn;
  }

  const _effect = new ReactiveEffect(fn);
  _effect.run();
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner;
  runner.effect = _effect;
  return runner;
}

export function track(target: object, key: unknown) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    dep!.add(activeEffect!);
  }
}

export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps: (Dep | undefined)[] = [];

  if (key !== void 0) {
    deps.push(depsMap.get(key));
  }
  if (deps.length === 1) {
    if (deps[0]) {
      triggerEffects(deps[0]);
    }
  } else {
    const effects: ReactiveEffect[] = [];
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep);
      }
    }
    triggerEffects(new Set(effects));
  }
}

export function triggerEffects(dep: Dep | ReactiveEffect[]) {
  const effects = Array.isArray(dep) ? dep : [...dep];

  for (const effect of effects) {
    if (effect !== activeEffect) {
      effect.run();
    }
  }
}
