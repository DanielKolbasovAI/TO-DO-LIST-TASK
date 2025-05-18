import { createAction, props } from '@ngrx/store';
import { TaskModel } from '../models/task.model';
import {UserModel} from '../../users/models/user.model';



export const loadTasks = createAction('[Tasks] Load Tasks');

export const loadTasksSuccess = createAction('[Tasks] Load Tasks Success', props<{ tasks: TaskModel[], users: UserModel[]}>());
export const loadTasksFailure = createAction('[Tasks] Load Tasks Failure', props<{ error: any }>());

export const createTask = createAction('[Tasks] Create New Task');
export const deleteNewTask = createAction('[Tasks] Delete New Task', props<{ taskId: string }>());

export const markAsRemoved = createAction('[Tasks] Mark Task as Removed', props<{ taskId: string }>());


export const deleteTask = createAction('[Tasks] Delete Task', props<{ taskId: string }>());
export const deleteTaskSuccess = createAction('[Tasks] Delete Task Success', props<{ taskId: string }>());

export const updateTaskLocally = createAction('[Tasks] Update Task Locally', props<{ task: TaskModel }>());

export const revertTaskChanges = createAction('[Tasks] Revert Task Changes', props<{ taskId: string }>());
export const revertAllTaskChanges = createAction('[Tasks] Revert All Task Changes');

export const saveTask = createAction('[Tasks] Save Task To Server', props<{ taskId: string }>());
export const saveTaskSuccess = createAction('[Tasks] Save Task Success', props<{ originalTask: TaskModel; savedTask: TaskModel }>());
export const saveTaskFailure = createAction('[Tasks] Save Task Failure', props<{ error: any }>());

export const saveAllChangesSuccess = createAction('[Tasks] Save All Changes Success', props<{ tasks: TaskModel[] }>());
export const saveAllChangesFailure = createAction('[Tasks] Save All Changes Failure', props<{ error: any }>());

export const lockTaskSuccess = createAction('[Tasks] Lock Task Success', props<{ task: TaskModel }>());
export const lockTaskFailure = createAction('[Tasks] Lock Task Failure', props<{ error: any }>());

export const unlockTaskSuccess = createAction('[Tasks] Unlock Task Success', props<{ task: TaskModel }>());
export const unlockTaskFailure = createAction('[Tasks] Unlock Task Failure', props<{ error: any }>());

export const setModifiedTask = createAction('[Tasks] Set Task into modified set', props<{ taskId: string }>());

export const enterEditMode = createAction('[Tasks] Enter Edit Mode for Task', props<{ taskId: string }>());
export const exitEditMode = createAction('[Tasks] Exit Edit Mode for Task', props<{ taskId: string }>());

export const syncCreateTask = createAction('[Sync] Create Task', props<{ task: TaskModel }>());
export const syncUpdateTask = createAction('[Sync] Update Task', props<{ task: TaskModel }>());
export const syncDeleteTask = createAction('[Sync] Delete Task', props<{ taskId: string }>());
