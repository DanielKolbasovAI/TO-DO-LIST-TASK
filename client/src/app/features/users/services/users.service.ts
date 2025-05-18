// src/app/services/users.service.ts

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import * as UsersSelectors from '../statemanagment/users.selectors';
import * as UsersActions from '../statemanagment/users.actions';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private store: Store) {}

  /**
   * Add or update a single user in the store
   */
  setUser(user: UserModel): void {
    this.store.dispatch(UsersActions.loadUser({ user }));
  }


  /**
   * Get an observable of a user by userId
   */
  getUserById(userId: string): Observable<UserModel | undefined> {
    return this.store.select(UsersSelectors.selectUserById(userId));
  }

}
