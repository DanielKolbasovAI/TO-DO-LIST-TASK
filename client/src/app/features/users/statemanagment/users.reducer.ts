import { createReducer, on } from '@ngrx/store';
import { initialUsersState } from './users.state';
import * as UsersActions from './users.actions';
import * as TasksActions from '../../tasks/statemanagement/tasks.actions';

export const usersReducer = createReducer(
  initialUsersState,

  on(TasksActions.loadTasksSuccess, (state, { users }) => {
    const userMap = Object.fromEntries(users.map(user => [user.userId, user]));
    return {
      ...state,
      users: userMap // or replace completely
    };
  }),

  on(UsersActions.loadUser, (state, { user }) => ({
    ...state,
    users: {
      ...state.users,
      [user.userId]: user
    }
  })),
);
