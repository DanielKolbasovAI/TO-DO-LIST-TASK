import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import {authGuard} from './guards/auth.guard';
//import {TasksEffects} from './features/tasks/statemanagement/tasks.effects';
import {provideEffects} from '@ngrx/effects';
import {provideStore} from '@ngrx/store';
import {tasksReducer} from './features/tasks/statemanagement/tasks.reducer';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [authGuard],
    // providers: [
    //   provideEffects([TasksEffects]),   // ✅ this works officially
    // ]
  }
];

export const AppRouter = provideRouter(routes);
