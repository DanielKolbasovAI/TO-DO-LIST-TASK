import {UserModel} from '../../users/models/user.model';

export interface TaskModel {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  //createdBy: string;
  lockedBy: string | null;
  isNew: boolean;
  isMarkedForDelete: boolean;
}

export interface LoadTasksResponse {
  tasks: TaskModel[];
  users: UserModel[];
}
