import {TaskModel} from '../models/task.model';
import { Set } from 'immutable';
export interface TasksState {
  originalTaskMap: Record<string, TaskModel>;
  editableTaskMap: Record<string, TaskModel>;
  changeTaskMap: Record<string, TaskModel>;
  modifiedTaskSet: Set<string>;
  editingTaskSet: Set<string>;
  loading: boolean;
  error: any;
}

export const initialTaskState: TasksState = {
  originalTaskMap: {},
  editableTaskMap: {},
  changeTaskMap: {},
  modifiedTaskSet: Set<string>(),
  editingTaskSet: Set<string>(),
  loading: false,
  error: null
};
