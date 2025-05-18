import { bootstrapApplication } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { tasksReducer } from './app/features/tasks/statemanagement/tasks.reducer';
import {TaskService} from './app/features/tasks/services/tasks.service';
import {AuthHttpInterceptor} from './app/features/auth/services/auth-http.interceptor';
import {usersReducer} from './app/features/users/statemanagment/users.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },

    provideStore({ tasks: tasksReducer, users: usersReducer}),

    { provide: TaskService, useClass: TaskService },
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false
    })
  ]
}).catch(err => console.error(err));
