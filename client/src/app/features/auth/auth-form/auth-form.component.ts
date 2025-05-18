import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  isDevMode,
  OnInit,
  Output
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {AuthApiService} from '../services/auth-api.service';
import { Observable, of} from 'rxjs';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthFormComponent implements OnInit {
  @Input() title: string = '';
  @Input() buttonLabel: string = '';
  @Input() linkText: string = '';
  @Input() linkRoute: string = '';

  @Input() showUsername = false;
  @Input() showFirstName = false;
  @Input() showLastName = false;
  @Input() showEmail = false;
  @Input() showConfirmPassword = false;

  @Output() submitForm = new EventEmitter<{
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
  }>();

  username = "";
  email = "";
  firstName = "";
  lastName = "";
  password = "";
  confirmPassword = "";
  private fb = inject(FormBuilder);
  private api = inject(AuthApiService);
  form!: FormGroup

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [""],
      email: [""],
      firstName: [""],
      lastName: [""],
      password: [
        "",
        isDevMode() ? [Validators.required] : [Validators.required, Validators.minLength(8)]
      ],
      confirmPassword: [""]
    }, { });

    if (this.showUsername) {
      this.form.get("username")?.setValidators([Validators.required]);
      this.form.get("username")?.addAsyncValidators(this.uniqueUsernameValidator());
      this.form.get("username")?.updateValueAndValidity();
    }

    if (this.showFirstName) {
      this.form.get("firstName")?.setValidators([Validators.required]);
      this.form.get("firstName")?.updateValueAndValidity();
    }

    if (this.showLastName) {
      this.form.get("lastName")?.setValidators([Validators.required]);
      this.form.get("lastName")?.updateValueAndValidity();
    }

    if (this.showEmail) {
      this.form.get("email")?.setValidators([Validators.required, Validators.email]);
      this.form.get("email")?.updateValueAndValidity();
    }

    if (this.showConfirmPassword) {
      this.form.get("confirmPassword")?.setValidators([Validators.required]);
      this.form.get("confirmPassword")?.updateValueAndValidity();
      this.form.setValidators(this.passwordsMatchValidator())
    }
  }


  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    this.submitForm.emit({
      username: this.showUsername ? value.username : "",
      email: this.showEmail ? value.email : "",
      firstName: this.showFirstName ? value.firstName : "",
      lastName: this.showLastName ? value.lastName : "",
      password: value.password,
      confirmPassword: this.showConfirmPassword ? value.confirmPassword : ""
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.touched && control.invalid;
  }

  private uniqueUsernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      return of(null);
      // return this.api.checkUsernameExists(control.value).pipe(
      //   map(exists => exists ? { usernameTaken: true } : null)
      // );
    };
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get("password")?.value;
      const confirmPassword = group.get("confirmPassword")?.value;
      return password === confirmPassword ? null : { passwordsMismatch: true };
    };
  }



}
