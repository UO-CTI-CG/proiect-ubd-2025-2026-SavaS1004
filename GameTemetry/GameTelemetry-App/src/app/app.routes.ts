import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.gurd';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    //canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    //canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    //canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  //{
  //  path: 'workouts',
  //  loadComponent: () => import('./pages/workouts/list/list.page').then(m => m.ListPage)
  //},
  //{
  //  path: 'workouts/:id',
  //  loadComponent: () => import('./pages/workouts/detail/detail.page').then(m => m.DetailPage)
  //}
];
