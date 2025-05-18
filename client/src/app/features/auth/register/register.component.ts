import {ChangeDetectionStrategy, Component} from '@angular/core';
import { AuthFormComponent } from '../auth-form/auth-form.component';
import { AuthApiService } from '../services/auth-api.service';
import { AuthSessionService } from '../services/auth-session.service';
import { RegisterFormModel} from './model/register.model';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [AuthFormComponent],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  constructor(private api: AuthApiService, private session: AuthSessionService) {}

  register(registerModel: RegisterFormModel) {
    if (registerModel.password !== registerModel.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.api.register(registerModel).subscribe({
      next: res => this.session.login(res.token),
      error: () => alert('Registration failed')
    });
  }
}
