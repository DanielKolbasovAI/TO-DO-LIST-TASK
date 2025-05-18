import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { AuthSessionService } from './auth-session.service';
import {Router} from '@angular/router';
import {TokenStorageService} from '../../../core/token-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  private authSession = inject(AuthSessionService);
  private router = inject(Router);
  private storage = inject(TokenStorageService);
  private snackBar = inject(MatSnackBar);
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authSession.getToken();

    let headers: { [name: string]: string } = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const operation = this.guessOperation(req.method, req.url);
    if (operation) {
      headers['x-api-operation'] = operation;
    }
    const cloned = req.clone({ setHeaders: headers });

    return next.handle(cloned).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.storage.removeToken();
          this.router.navigate(['/login']);
        }
        else {
          this.snackBar.open(error?.error?.message || 'Unexpected error', 'Close', {
            duration: 5000,
            panelClass: ['custom-snackbar'],
            verticalPosition: 'bottom', // 'top' or 'bottom'
            horizontalPosition: 'right', // 'start', 'center', 'end', 'left', or 'right'
          });
        }
        return throwError(() => error);
      })
    );
  }

  private guessOperation(method: string, url: string): string | undefined {
    const cleanUrl = url.split('?')[0];

    if (cleanUrl.match(/\/tasks\/[^/]+$/)) {
      if (method === 'GET') return 'loadTask';
      if (method === 'PUT') return 'updateSingleTask';
      if (method === 'DELETE') return 'deleteTask';
    }

    if (cleanUrl.endsWith('/tasks')) {
      if (method === 'GET') return 'loadAllTasks';
      if (method === 'POST') return 'createTask';
      if (method === 'PUT') return 'bulkSaveTasks';
    }

    return undefined;
  }
}
