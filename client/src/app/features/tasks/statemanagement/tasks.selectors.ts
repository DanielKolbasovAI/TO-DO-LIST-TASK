import { createSelector } from '@ngrx/store';
import { TasksState } from './tasks.state';

export const selectTasksState = (state: any) => state.tasks as TasksState;

export const selectEditableTaskMap = createSelector(
  selectTasksState,
  (state) => state.editableTaskMap
);

export const selectChangeTaskMap = createSelector(
  selectTasksState,
  (state) => state.changeTaskMap
);


export const selectAllEditableTasks = createSelector(
  selectEditableTaskMap,
  (map) => Object.values(map)
);

export const selectAllChangedTasks = createSelector(
  selectChangeTaskMap,
  (map) => Object.values(map)
);

export const selectEditableTaskById = (taskId: string) => createSelector(
  selectEditableTaskMap,
  (map) => map[taskId]
);

export const selectModifiedTaskSet = createSelector(
  selectTasksState,
  (state: TasksState) => state.modifiedTaskSet
);

export const selectHasAnyModifiedTasks = createSelector(
  selectModifiedTaskSet,
  (set) => set.size > 0
);

export const selectIsModifiedTask = (taskId: string) => createSelector(
  selectModifiedTaskSet,
  (set) => set.has(taskId)
);

export const selectEditingTaskSet = createSelector(
  selectTasksState,
  (state: TasksState) => state.editingTaskSet
);


export const selectIsEditingTask = (taskId: string) => createSelector(
  selectEditingTaskSet,
  (set) => set.has(taskId)
);
