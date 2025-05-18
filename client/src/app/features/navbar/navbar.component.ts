import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskService } from '../tasks/services/tasks.service';
import { Observable } from 'rxjs';
import {UserModel} from '../users/models/user.model';
import {AuthSessionService} from '../auth/services/auth-session.service';
import {TokenStorageService} from '../../core/token-storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  menuOpen = false;
  hasChanges$: Observable<boolean>;
  loggedInUser: UserModel | null = null;
  constructor(
    private router: Router,
    private taskService: TaskService,
    private authSessionService: AuthSessionService,
    private tokenStorageService: TokenStorageService
  ) {
    this.hasChanges$ = this.taskService.hasUnsavedChanges();
    this.loggedInUser = this.authSessionService.getCurrentUser();
  }

  createNewTask() {
    this.taskService.createTask();
  }

  saveAllChanges() {
    this.taskService.saveAllChanges();
  }

  revertAllChanges() {
    this.taskService.revertAllChanges();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.tokenStorageService.removeToken()
    this.router.navigate(['/login']);
  }
}
