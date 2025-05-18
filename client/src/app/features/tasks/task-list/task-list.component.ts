import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject, takeUntil} from 'rxjs';
import { TaskModel } from '../models/task.model';
import { TaskService } from '../services/tasks.service';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '../task-item/task-item.component';
import {SyncService} from '../../../core/sync.service';

@Component({
  selector: 'task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [CommonModule, TaskItemComponent]
})
export class TaskListComponent implements OnInit, OnDestroy  {
  private destroy$ = new Subject<void>();
  private syncService = inject(SyncService);
  private taskService = inject(TaskService);
  tasks$!: Observable<TaskModel[]>;

  //constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.syncService.connect();
    this.tasks$ = this.taskService.getAllEditableTasks();
    this.taskService.loadTasks();
    this.syncService.taskChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(change => {
        if (change.created) {
          change.created.forEach((task: TaskModel) => this.taskService.createTaskLocallyAfterSync(task));
        }

        if (change.updated) {
          change.updated.forEach((task: TaskModel) => this.taskService.updateTaskLocallyAfterSync(task));
        }

        if (change.deleted) {
          change.deleted.forEach((taskId: string) => this.taskService.removeLocallyAfterSync(taskId));
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.syncService.disconnect();
  }
}
