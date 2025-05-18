import { UserModel } from '../models/user.model';

export interface UsersState {
  users: { [userId: string]: UserModel };  // user dictionary by userId
}

export const initialUsersState: UsersState = {
  users: {}
};
