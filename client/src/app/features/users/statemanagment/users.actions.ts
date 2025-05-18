import { createAction, props } from '@ngrx/store';
import { UserModel } from '../models/user.model';

export const loadUser = createAction(
  '[Users] Load User',
  props<{ user: UserModel }>()
);


