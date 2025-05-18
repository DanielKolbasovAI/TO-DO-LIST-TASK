import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/http.service';
import { TaskModel } from '../models/task.model';
import {LoadTasksResponse} from '../models/task.model';
import {environment} from '../../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private http = inject(HttpService);

  private baseUrl = environment.taskApiUrl;

  getTasks(options?: { page?: number; limit?: number; includeUsers?: boolean; all?: boolean }): Observable<LoadTasksResponse> {
    const { page = 1, limit = 50, includeUsers = true, all = true } = options ?? {};
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      includeUsers: String(includeUsers),
      all: String(all)
    });

    return this.http.get<LoadTasksResponse>(`${this.baseUrl}?${params.toString()}`);
  }
  getById(taskId: string): Observable<TaskModel> {
    return this.http.get<TaskModel>(`${this.baseUrl}/${taskId}`);
  }

  create(task: Partial<TaskModel>): Observable<TaskModel> {
    return this.http.post<TaskModel>(`${this.baseUrl}`, task);
  }

  update(task: Partial<TaskModel>): Observable<TaskModel> {
    return this.http.put<TaskModel>(`${this.baseUrl}/${task.id}`, task);
  }

  delete(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}`);
  }

  lock(taskId: string): Observable<TaskModel> {
    return this.http.post<TaskModel>(`${this.baseUrl}/${taskId}/lock`,{});
  }

  unlock(taskId: string): Observable<TaskModel> {
    return this.http.post<TaskModel>(`${this.baseUrl}/${taskId}/unlock`, {});
  }

  saveAllChanges(data: { toCreate: TaskModel[]; toUpdate: TaskModel[]; toDelete: string[]; }): Observable<{ updatedTasks: TaskModel[] }> {
    return this.http.post<{ updatedTasks: TaskModel[] }>(`${this.baseUrl}/saveAll`, data);
  }

  unlockAllTasks(tasksIds: Immutable.Set<string>) {
    return this.http.post<{ tasksIds: string[] }>(`${this.baseUrl}/unlockAllTasksByIds`, tasksIds.toArray());
  }
}
