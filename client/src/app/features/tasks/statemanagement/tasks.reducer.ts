import {createReducer, on} from '@ngrx/store';
import * as TaskActions from './tasks.actions';
import {initialTaskState} from './tasks.state';
import {TaskModel} from '../models/task.model';

export const tasksReducer = createReducer(
  initialTaskState,

  // ---------------------------------------- load tasks from server ------------------------------------------------
  on(TaskActions.loadTasks, (state) => ({ ...state, loading: true })),

  on(TaskActions.loadTasksSuccess, (state, { tasks }) => {
    const map = Object.fromEntries(tasks.map(task => [task.id, task]));
    return {
      ...state,
      originalTaskMap: map,
      editableTaskMap: map,
      changeTaskMap: {},
      modifiedTaskSet: state.modifiedTaskSet.clear(),
      editingTaskSet: state.editingTaskSet.clear(),
      loading: false,
      error: null
    };
  }),
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ------------------------------------------------ local  actions ------------------------------------------------
  on(TaskActions.createTask, (state) => {
    const newTask: TaskModel = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      completed: false,
      lockedBy: null,
      isNew: true,
      isMarkedForDelete: false
    };
    return {
      ...state,
      editableTaskMap: {...state.editableTaskMap, [newTask.id]: newTask},
      changeTaskMap: {...state.changeTaskMap, [newTask.id]: newTask},
      modifiedTaskSet: state.modifiedTaskSet.add(newTask.id)
    };
  }),
  on(TaskActions.deleteTaskSuccess, (state, { taskId }) => {
    const { [taskId]: removed, ...editableRest } = state.editableTaskMap;
    const { [taskId]: changeRemoved, ...changeRest } = state.changeTaskMap;
    return {
      ...state,
      editableTaskMap: editableRest,
      changeTaskMap: changeRest,
      modifiedTaskSet: state.modifiedTaskSet.delete(taskId),
    };
  }),

  on(TaskActions.deleteNewTask, (state, { taskId }) => {
    const { [taskId]: _, ...editableRest } = state.editableTaskMap;
    const { [taskId]: __, ...changeRest } = state.changeTaskMap;
    return {
      ...state,
      editableTaskMap: editableRest,
      changeTaskMap: changeRest,
      modifiedTaskSet: state.modifiedTaskSet.delete(taskId),
      editingTaskSet: state.editingTaskSet.delete(taskId)
    };
  }),

  on(TaskActions.updateTaskLocally, (state, { task }) => ({
    ...state,
    editableTaskMap: { ...state.editableTaskMap, [task.id]: task },
    changeTaskMap: { ...state.changeTaskMap, [task.id]: task }
  })),

  on(TaskActions.revertTaskChanges, (state, { taskId }) => {
    if (state.editableTaskMap[taskId]?.isNew) {
      const { [taskId]: _, ...editableRest } = state.editableTaskMap;
      const { [taskId]: __, ...changeRest } = state.changeTaskMap;
      return {
        ...state,
        editableTaskMap: editableRest,
        changeTaskMap: changeRest,
        modifiedTaskSet: state.modifiedTaskSet.delete(taskId),
        editingTaskSet: state.editingTaskSet.delete(taskId)
      };
    } else {
      const { [taskId]: __, ...changeRest } = state.changeTaskMap;
      return {
        ...state,
        editableTaskMap: { ...state.editableTaskMap, [taskId]: state.originalTaskMap[taskId] },
        changeTaskMap: changeRest,
        modifiedTaskSet: state.modifiedTaskSet.delete(taskId),
        editingTaskSet: state.editingTaskSet.delete(taskId)
      };
    }
  }),

  on(TaskActions.revertAllTaskChanges, (state) => ({
    ...state,
    editableTaskMap: state.originalTaskMap,
    changeTaskMap: {},
    modifiedTaskSet: state.modifiedTaskSet.clear(),
    editingTaskSet: state.editingTaskSet.clear()
  })),

  on(TaskActions.markAsRemoved, (state, { taskId }) => {
    const updatedTask = {
      ...state.editableTaskMap[taskId],
      isMarkedForDelete: true
    };

    return {
      ...state,
      editableTaskMap: {
        ...state.editableTaskMap,
        [taskId]: updatedTask
      },
      changeTaskMap: {
        ...state.changeTaskMap,
        [taskId]: updatedTask
      },
      modifiedTaskSet: state.modifiedTaskSet.add(taskId)
    };
  }),

  // ------------------------------------------------ server save (single) ---------------------------------------------
  on(TaskActions.saveTaskSuccess, (state, { originalTask, savedTask }) => {
    const tempId = originalTask.id;
    const realId = savedTask.id;

    let newEditableTaskMap = { ...state.editableTaskMap };
    let newChangeTaskMap = { ...state.changeTaskMap };
    let newOriginalTaskMap = { ...state.originalTaskMap };
    let newModifiedTaskSet = state.modifiedTaskSet;
    let newEditingTaskSet = state.editingTaskSet;

    if (originalTask.isNew && tempId !== realId) {
      delete newEditableTaskMap[tempId];
      delete newChangeTaskMap[tempId];
      delete newOriginalTaskMap[tempId];
      newModifiedTaskSet = newModifiedTaskSet.delete(tempId);
      newEditingTaskSet = newEditingTaskSet.delete(tempId);
    }

    newEditableTaskMap[realId] = savedTask;
    newOriginalTaskMap[realId] = savedTask;
    delete newChangeTaskMap[tempId];
    newModifiedTaskSet = newModifiedTaskSet.delete(tempId);
    newEditingTaskSet = newEditingTaskSet.delete(tempId);

    return {
      ...state,
      editableTaskMap: newEditableTaskMap,
      originalTaskMap: newOriginalTaskMap,
      changeTaskMap: newChangeTaskMap,
      modifiedTaskSet: newModifiedTaskSet,
      editingTaskSet: newEditingTaskSet
    };
  }),

  on(TaskActions.saveTaskFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // --------------------------------------------- server save (all) ------------------------------------------------
  on(TaskActions.saveAllChangesSuccess, (state, { tasks }) => {
    const updates = Object.fromEntries(tasks.map(task => [task.id, task]));
    return {
      ...state,
      originalTaskMap: { ...state.originalTaskMap, ...updates },
      editableTaskMap: { ...state.editableTaskMap, ...updates },
      changeTaskMap: {},
      modifiedTaskSet: state.modifiedTaskSet.clear(),
      editingTaskSet: state.editingTaskSet.clear()
    };
  }),
  on(TaskActions.saveAllChangesFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // ------------------------------------------------ lock / unlock ------------------------------------------------
  on(TaskActions.lockTaskSuccess, (state, { task }) => ({
    ...state,
    editableTaskMap: { ...state.editableTaskMap, [task.id]: task }
  })),
  on(TaskActions.unlockTaskSuccess, (state, { task }) => ({
    ...state,
    editableTaskMap: { ...state.editableTaskMap, [task.id]: task }
  })),

  // ------------------------------------------------ Modified tasks  ------------------------------------------------
  on(TaskActions.setModifiedTask, (state, { taskId }) => ({
    ...state,
    modifiedTaskSet: state.modifiedTaskSet.add(taskId)
  })),

  // ------------------------------------------------ Editing tasks  ------------------------------------------------
  on(TaskActions.enterEditMode, (state, { taskId }) => ({
    ...state,
    editingTaskSet: state.editingTaskSet.add(taskId)
  })),
  on(TaskActions.exitEditMode, (state, { taskId }) => ({
    ...state,
    editingTaskSet: state.editingTaskSet.delete(taskId)
  })),

  // ------------------------------------------------ Sync actions ------------------------------------------------
  on(TaskActions.syncCreateTask, (state, { task }) => ({
    ...state,
    originalTaskMap: { ...state.originalTaskMap, [task.id]: task },
    editableTaskMap: { ...state.editableTaskMap, [task.id]: task }
  })),

  on(TaskActions.syncUpdateTask, (state, { task }) => ({
    ...state,
    originalTaskMap: { ...state.originalTaskMap, [task.id]: task },
    editableTaskMap: { ...state.editableTaskMap, [task.id]: task }
  })),

  on(TaskActions.syncDeleteTask, (state, { taskId }) => {
    const { [taskId]: _, ...originalRest } = state.originalTaskMap;
    const { [taskId]: __, ...editableRest } = state.editableTaskMap;
    const { [taskId]: ___, ...changeRest } = state.changeTaskMap;

    return {
      ...state,
      originalTaskMap: originalRest,
      editableTaskMap: editableRest,
      changeTaskMap: changeRest,
      modifiedTaskSet: state.modifiedTaskSet.delete(taskId),
      editingTaskSet: state.editingTaskSet.delete(taskId)
    };
  }),
);
