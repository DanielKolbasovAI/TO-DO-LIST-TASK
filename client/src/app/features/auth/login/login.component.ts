import {ChangeDetectionStrategy, Component} from '@angular/core';
import { AuthFormComponent } from '../auth-form/auth-form.component';
import { AuthApiService } from '../services/auth-api.service';
import { AuthSessionService } from '../services/auth-session.service';
import {TokenStorageService} from '../../../core/token-storage.service';
import {HttpEvent} from '@angular/common/http';
import {UsersService} from '../../users/services/users.service';
import {LoginFormModel} from './model/login.model';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [AuthFormComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  constructor(
    private api: AuthApiService,
    private authSessionService: AuthSessionService,
    private usersService: UsersService,
    ) {}

  login(loginModel: LoginFormModel) {
    this.api.login(loginModel).subscribe({
      next: (res) => {
        this.authSessionService.login(res.token);
        this.usersService.setUser(res.user);
      },
      error: () => alert('Login failed. Check username and password.')
    });
  }
}
