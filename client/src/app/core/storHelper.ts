// src/app/core/store-utils.ts
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Action } from '@ngrx/store';

/**
 * Dispatch an action only if the current store value does NOT satisfy the condition.
 */
export function dispatchIfChanged<T>(
  store: Store,
  selector$: Observable<T>,
  condition: (currentValue: T) => boolean,
  action: Action
): void {
  selector$.pipe(take(1)).subscribe(currentValue => {
    if (!condition(currentValue)) {
      store.dispatch(action);
    }
  });
}

/**
 * Dispatch an action if the selector emits a falsy value.
 */
export function dispatchIfNotExists<T>(
  store: Store,
  selector$: Observable<T>,
  action: Action
): void {
  dispatchIfChanged(store, selector$, value => Boolean(value), action);
}

/**
 * Get a synchronous snapshot of a store value (once).
 */
export function getSyncValue<T>(selector$: Observable<T>): T {
  let value: T | undefined;
  selector$.pipe(take(1)).subscribe(v => value = v);
  return value!;
}
