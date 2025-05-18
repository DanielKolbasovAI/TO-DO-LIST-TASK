// client/src/app/app.component.ts
import {Component, HostListener, inject, OnInit} from '@angular/core';
import {NavigationEnd, NavigationStart, Router, RouterOutlet} from '@angular/router';
import {NavbarComponent} from './features/navbar/navbar.component';
import {filter, Subject} from 'rxjs';
import {CommonModule} from '@angular/common';
import {UsersService} from './features/users/services/users.service';
import {AuthSessionService} from './features/auth/services/auth-session.service';
import {TaskService} from './features/tasks/services/tasks.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  showNavbar = false;

  private readonly authSession = inject(AuthSessionService);
  private readonly usersService = inject(UsersService);
  private readonly taskService = inject(TaskService);
  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const noNavbarRoutes = ['/login', '/register'];
      this.showNavbar = !noNavbarRoutes.includes(event.urlAfterRedirects);
    });
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.taskService.unlockAllMyLockedTasks();
    });
  }

  @HostListener('window:beforeunload')
  handlePageUnload() {
    this.taskService.unlockAllMyLockedTasks();
  }

  ngOnInit() {
    if (this.authSession.isAuthenticated()) {
      const currentUser = this.authSession.getCurrentUser();
      if (currentUser) {
        this.usersService.setUser(currentUser);
      }
    }
  }
}
