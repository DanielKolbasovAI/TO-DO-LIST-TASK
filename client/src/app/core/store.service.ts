// src/app/core/store.service.ts

import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Action } from '@ngrx/store';

/**
 * A helper service for safe conditional NgRx dispatching.
 * Prevents unnecessary dispatches when state does not require it.
 */
@Injectable({
  providedIn: 'root'
})
export class StoreService {
  constructor(private store: Store) {}

  /**
   * Dispatches an action ONLY if current store value does NOT satisfy expected condition.
   * @param selector$ - observable of store value (use store.select(...))
   * @param condition - function that returns true if state is already OK
   * @param action - the NgRx action to dispatch if condition is NOT met
   */
  dispatchIfChanged<T>(
    selector$: Observable<T>,
    condition: (currentValue: T) => boolean,
    action: Action
  ): void {
    selector$
      .pipe(take(1))
      .subscribe(currentValue => {
        if (!condition(currentValue)) {
          this.store.dispatch(action);
        }
      });
  }

  /**
   * Shortcut for common case: dispatch action if selector emits falsy value.
   * (e.g. if something is not yet loaded / set)
   * @param selector$ - observable of store value
   * @param action - action to dispatch if current store value is falsy
   */
  dispatchIfNotExists<T>(
    selector$: Observable<T>,
    action: Action
  ): void {
    this.dispatchIfChanged(
      selector$,
      currentValue => Boolean(currentValue),
      action
    );
  }

  getSyncValue<T>(obs$: Observable<T>): T {
    let value: T;
    obs$.pipe(take(1)).subscribe(obValue => value = obValue);
    return value;
  }
}
