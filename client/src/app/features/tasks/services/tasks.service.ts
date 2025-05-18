import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {catchError, map, Observable, take, tap, throwError} from 'rxjs';
import * as TasksSelectors from '../statemanagement/tasks.selectors';
import * as TasksActions from '../statemanagement/tasks.actions';
import { TaskModel } from '../models/task.model';
import { TaskApiService } from './task-api.service';
import {AuthSessionService} from '../../auth/services/auth-session.service';
import {selectEditingTaskSet} from '../statemanagement/tasks.selectors';
import {getSyncValue} from '../../../core/storHelper';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private currentUserId = "";

  constructor(
    private store: Store,
    private api: TaskApiService,
    private authSessionService: AuthSessionService
  ) {
    this.currentUserId = this.authSessionService.getUserId();
  }

  // ----------------------------------------------------- LOAD -------------------------------------------------------
  loadTasks() {
    this.store.dispatch(TasksActions.loadTasks());
    this.api.getTasks().pipe(take(1)).subscribe({
      next: response => this.store.dispatch(TasksActions.loadTasksSuccess({tasks: response.tasks, users: response.users})),
      error: error => this.store.dispatch(TasksActions.loadTasksFailure({error}))
    });
  }

  // ---------------------------------- LOCAL (create, delete, update, revert) ----------------------------------------
  createTask() {
    this.store.dispatch(TasksActions.createTask());
  }

  deleteNewTask(taskId: string) {
    this.store.dispatch(TasksActions.deleteNewTask({taskId}));
  }

  updateTaskLocally(task: TaskModel) {
    this.store.dispatch(TasksActions.updateTaskLocally({task}));
  }

  revertTaskChanges(taskId: string) {
    this.store.dispatch(TasksActions.revertTaskChanges({taskId}));
  }

  revertAllChanges() {
    this.store.dispatch(TasksActions.revertAllTaskChanges());
  }
  deleteTask(taskId: string) {
    this.store.select(TasksSelectors.selectEditableTaskById(taskId)).pipe(take(1)).subscribe(task => {
      if (task?.isNew) {
        this.store.dispatch(TasksActions.deleteTaskSuccess({taskId}));
      } else {
        this.store.dispatch(TasksActions.markAsRemoved({taskId}));
      }
    });
  }

  getTaskById(taskId: string): Observable<TaskModel | undefined> {
    return this.store.select(TasksSelectors.selectEditableTaskById(taskId));
  }

  // ------------------------------------------------SAVE TO SERVER------------------------------------------------
  createTaskOnServer(task: TaskModel): Observable<TaskModel> {
    return this.api.create(task).pipe(
      take(1),
      tap(saved => this.store.dispatch(
        TasksActions.saveTaskSuccess({ originalTask: task, savedTask: saved })
      ))
    );
  }

  updateTaskOnServer(task: TaskModel): Observable<TaskModel> {
    return this.api.update(task).pipe(
      take(1),
      tap(saved => this.store.dispatch(
        TasksActions.saveTaskSuccess({ originalTask: task, savedTask: saved })
      ))
    );
  }

  deleteTaskFromServer(taskId: string): Observable<void> {
    return this.api.delete(taskId).pipe(
      take(1),
      tap(() => this.store.dispatch(TasksActions.deleteTaskSuccess({ taskId })))
    );
  }
  saveAllChanges() {
    this.store.select(TasksSelectors.selectAllChangedTasks).pipe(take(1)).subscribe(tasks => {

      const toCreate = tasks.filter(t => t.isNew && !t.isMarkedForDelete);
      const toUpdate = tasks.filter(t => !t.isNew && !t.isMarkedForDelete);
      const toDelete = tasks.filter(t => t.isMarkedForDelete && !t.isNew);
      const toForget = tasks.filter(t => t.isMarkedForDelete && t.isNew);

      // Locally remove tasks never saved
      toForget.forEach(task => {
        this.store.dispatch(TasksActions.deleteTaskSuccess({ taskId: task.id }));
      });

      const payload = {
        toCreate,
        toUpdate,
        toDelete: toDelete.map(t => t.id)
      };

      this.api.saveAllChanges(payload).pipe(take(1)).subscribe({
        next: result => {
          this.loadTasks();
        },
        error: error => {
          this.store.dispatch(TasksActions.saveAllChangesFailure({ error }));
        }
      });
    });
  }


  // ------------------------------------------------ LOCK / UNLOCK ------------------------------------------------
  lockTask(taskId: string): Observable<TaskModel> {
    return this.api.lock(taskId).pipe(
      tap(task => this.store.dispatch(TasksActions.lockTaskSuccess({task}))),
      catchError(error => {
        this.store.dispatch(TasksActions.lockTaskFailure({error}));
        return throwError(() => error);
      })
    );
  }

  unlockTask(taskId: string): Observable<TaskModel> {
    return this.api.unlock(taskId).pipe(
      tap({
        next: task => this.store.dispatch(TasksActions.unlockTaskSuccess({task})),
        error: error => this.store.dispatch(TasksActions.unlockTaskFailure({error}))
      }));
  }
  unlockAllMyLockedTasks(): void {
    this.api.unlockAllTasks(getSyncValue(this.store.select(TasksSelectors.selectEditingTaskSet)));
  }

  // ------------------------------------------------ MODIFIED OPERATIONS ----------------------------------------------
  markTaskModified(taskId: string) {
    this.store.dispatch(TasksActions.setModifiedTask({taskId}));
  }

  isTaskModified(taskId: string): Observable<boolean> {
    return this.store.select(TasksSelectors.selectIsModifiedTask(taskId));
  }

  hasUnsavedChanges(): Observable<boolean> {
    return this.store.select(TasksSelectors.selectHasAnyModifiedTasks);
  }


  // ------------------------------------------------ EDITING OPERATIONS -----------------------------------------------
  enterEditMode(taskId: string) {
    this.store.dispatch(TasksActions.enterEditMode({taskId}));
  }

  exitEditMode(taskId: string) {
    this.store.dispatch(TasksActions.exitEditMode({taskId}));
  }

  isTaskInEditMode(taskId: string): Observable<boolean> {
    return this.store.select(TasksSelectors.selectIsEditingTask(taskId));
  }

  getAllEditableTasks(): Observable<TaskModel[]> {
    return this.store.select(TasksSelectors.selectAllEditableTasks);
  }


  // ------------------------------------------------ HELPERS ------------------------------------------------
  getIsTaskLocked(task: TaskModel): boolean {
    return !!task.lockedBy && task.lockedBy !== this.currentUserId;
  }

  // ------------------------------------------------ SYNC OPERATIONS ------------------------------------------------
  createTaskLocallyAfterSync(task: TaskModel) {
    this.store.dispatch(TasksActions.syncCreateTask({ task }));

  }

  updateTaskLocallyAfterSync(task: TaskModel) {
    this.store.dispatch(TasksActions.syncUpdateTask({ task }));

  }

  removeLocallyAfterSync(taskId: string) {
    this.store.dispatch(TasksActions.syncDeleteTask({ taskId }));
  }
}
