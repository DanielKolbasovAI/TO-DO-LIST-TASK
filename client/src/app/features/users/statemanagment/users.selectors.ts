import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.state';

export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectAllUsers = createSelector(
  selectUsersState,
  state => state.users
);

export const selectUserById = (userId: string) =>
  createSelector(
    selectUsersState,
    state => state.users[userId]
  );
