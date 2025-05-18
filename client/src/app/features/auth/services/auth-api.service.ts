import {inject, Injectable} from '@angular/core';
import {HttpService} from '../../../core/http.service';
import {UserModel} from '../../users/models/user.model';
import {LoginFormModel} from '../login/model/login.model';
import {RegisterFormModel} from '../register/model/register.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpService);
  private baseUrl = 'http://localhost:5001/api/auth';

  login(loginModel: LoginFormModel) {
    const { username, password } = loginModel;
    return this.http.post<{
      user: UserModel;
      token: string }>(`${this.baseUrl}/login`, { username, password });
  }
  register(registerModel: RegisterFormModel) {
    const { username,email,firstName,lastName,password,confirmPassword } = registerModel;
    return this.http.post<{ token: string }>(`${this.baseUrl}/register`, { username, email,firstName,lastName, password});
  }

  // logout() {
  //   return this.http.post(`${this.baseUrl}/logout`, {});
  // }
}
