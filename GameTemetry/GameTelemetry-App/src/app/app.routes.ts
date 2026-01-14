import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'exercises',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/exercises/exercises.page').then((m) => m.ExercisesPage),
  },
  {
    path: 'workouts/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/workouts/create/create.page').then(
        (m) => m.CreateWorkoutPage
      ),
  },
  {
    path: 'workouts/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/workouts/edit/edit.page').then((m) => m.EditWorkoutPage),
  },
  {
    path: 'workouts/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/workouts/detail/detail.page').then((m) => m.DetailPage),
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/analytics/analytics.page').then((m) => m.AnalyticsPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
];
