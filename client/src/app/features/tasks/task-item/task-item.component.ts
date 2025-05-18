import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {debounceTime, Observable, of, Subject, switchMap, take} from 'rxjs';
import {TaskModel} from '../models/task.model';
import {TaskService} from '../services/tasks.service';
import {AuthSessionService} from '../../auth/services/auth-session.service';
import {UsersService} from '../../users/services/users.service';
import {UserModel} from '../../users/models/user.model';
import {getSyncValue} from '../../../core/storHelper';

@Component({
  selector: 'task-item',
  standalone: true,
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class TaskItemComponent implements OnInit, OnDestroy, OnChanges {
  @Input() taskId!: string;

  task$!: Observable<TaskModel | undefined>;
  isTaskModified$!: Observable<boolean>;
  isTaskEditing$!: Observable<boolean>;
  lockedByUser$!: Observable<UserModel | undefined>;

  private currentUserId = ""; // Replace later with real user
  private titleChanged$ = new Subject<TaskModel>();
  private descriptionChanged$ = new Subject<TaskModel>();
  private titleDirty = false;
  private descriptionDirty = false;

  private readonly taskService = inject(TaskService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly usersService = inject(UsersService);

  ngOnInit() {
    this.task$ = this.taskService.getTaskById(this.taskId);
    this.isTaskModified$ = this.taskService.isTaskModified(this.taskId);
    this.isTaskEditing$ = this.taskService.isTaskInEditMode(this.taskId);
    this.currentUserId = this.authSessionService.getUserId();

    this.lockedByUser$ = this.task$.pipe(
      switchMap(task => {
        if (!task?.lockedBy) return of(undefined);
        return this.usersService.getUserById(task.lockedBy);
      })
    );

    this.titleChanged$
      .pipe(debounceTime(100000))
      .subscribe(updatedTask => {
        if (this.titleDirty) {
          this.taskService.updateTaskLocally(updatedTask);
          this.titleDirty = false;
        }
      });
    this.descriptionChanged$
      .pipe(debounceTime(100000))
      .subscribe(updatedTask => {
        if (this.descriptionDirty) {
          this.taskService.updateTaskLocally(updatedTask);
          this.descriptionDirty = false;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['taskId'] && changes['taskId'].currentValue) {
      this.task$ = this.taskService.getTaskById(this.taskId);
      this.isTaskModified$ = this.taskService.isTaskModified(this.taskId);
      this.isTaskEditing$ = this.taskService.isTaskInEditMode(this.taskId);
      this.lockedByUser$ = this.task$.pipe(
        switchMap(task => !task?.lockedBy ? of(undefined) : this.usersService.getUserById(task.lockedBy))
      );
    }
  }

  ngOnDestroy(){
    this.titleChanged$.unsubscribe();
    this.descriptionChanged$.unsubscribe();
  }

  enterEditMode(task: TaskModel) {
    if (!task.isNew) {
      this.taskService.lockTask(task.id).pipe(take(1)).subscribe({
        next: () => this.taskService.enterEditMode(task.id),
        error: err => console.error('Lock failed:', err),
      });
    } else {
      this.taskService.enterEditMode(task.id);
    }
  }

  onDeleteClick(task: TaskModel) {
    this.taskService.deleteTask(task.id);
  }

  onCancelClick(task: TaskModel) {
    if (task.isNew) {
      this.taskService.deleteTask(task.id);
    } else {
      this.taskService.revertTaskChanges(task.id);
      this.taskService.unlockTask(task.id).pipe(take(1)).subscribe({
        next: () => this.taskService.exitEditMode(task.id),
        error: err => console.error('Unlock failed:', err),
      });
    }

  }

  isLockedByOtherUser(task: TaskModel): boolean {
   return this.taskService.getIsTaskLocked(task);
  }

  saveTask(task: TaskModel) {
    if (task.isMarkedForDelete) {
      if (task.isNew) {
        this.taskService.deleteNewTask(task.id); // local only
      } else {
        this.taskService.deleteTaskFromServer(task.id).subscribe({
          next: () => this.taskService.exitEditMode(task.id)
        });
      }
      return;
    }

    if (task.isNew) {
      this.taskService.createTaskOnServer(task).subscribe({
        next: saved => {
          this.taskService.exitEditMode(saved.id);
        }
      });
    } else {
      this.taskService.updateTaskOnServer(task).subscribe({
        next: saved => {
          this.taskService.exitEditMode(saved.id);
          this.taskService.unlockTask(saved.id).subscribe();
        }
      });
    }
  }

  getTaskStatus(task: TaskModel): { type: 'new' | 'deleted' | 'modified' | null, tooltip: string } {
    if (task.isNew) {
      return { type: 'new', tooltip: 'New Task Created' };
    }
    if (task.isMarkedForDelete) {
      return { type: 'deleted', tooltip: 'Marked for delete' };
    }
    if (getSyncValue(this.taskService.isTaskModified(task.id))) {
      return { type: 'modified', tooltip: 'Task modified' };
    }
    return { type: null, tooltip: '' };
  }

  onCheckboxChange(task: TaskModel, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const updatedTask = { ...task, completed: checked };
    this.taskService.markTaskModified(task.id);
    this.taskService.updateTaskLocally(updatedTask);
  }

  onTitleInput(task: TaskModel, event: Event) {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.titleDirty = true;
    this.taskService.markTaskModified(task.id);
    this.titleChanged$.next({ ...task, title: value });
  }

  onTitleBlur(task: TaskModel, event: Event) {
    const value = (event.target as HTMLInputElement).value ?? '';
    if (this.titleDirty) {
      this.taskService.updateTaskLocally({ ...task, title: value });
      this.titleDirty = false;
    }
  }

  onDescriptionInput(task: TaskModel, event: Event) {
    const value = (event.target as HTMLTextAreaElement).value ?? '';
    this.descriptionDirty = true;
    this.taskService.markTaskModified(task.id);
    this.descriptionChanged$.next({ ...task, description: value });
  }

  onDescriptionBlur(task: TaskModel, event: Event) {
    const value = (event.target as HTMLTextAreaElement).value ?? '';
    if (this.descriptionDirty) {
      this.taskService.updateTaskLocally({ ...task, description: value });
      this.descriptionDirty = false;
    }
  }
}
