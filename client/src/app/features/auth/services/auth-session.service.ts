import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../../core/token-storage.service';
import { AuthApiService } from './auth-api.service';
import {UserModel} from '../../users/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private router = inject(Router);
  private storage = inject(TokenStorageService);
  private api = inject(AuthApiService);

  login(token: string) {
    this.storage.setToken(token);
    this.router.navigate(['/tasks']);
  }

  // logout() {
  //   const token = this.getToken();
  //   if (token) {
  //     this.api.logout().subscribe({
  //       next: () => {},
  //       error: () => {},
  //       complete: () => this.finishLogout()
  //     });
  //   } else {
  //     this.finishLogout();
  //   }
  // }

  private finishLogout() {
    this.storage.removeToken();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserId(): string  {
    const token = this.getToken();
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? "";
    } catch {
      return "";
    }


  }

  getCurrentUser(): UserModel | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId ?? "",
        username: payload.username ?? "",
        firstName: payload.firstName ?? "",
        lastName: payload.lastName ?? ""
      };
    } catch {
      return null;
    }
  }
}
