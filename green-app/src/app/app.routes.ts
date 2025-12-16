import { Routes } from '@angular/router';
import {authGuard} from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage) },
  {
    path: 'app',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./tabs/tabs.routes').then(m => m.routes),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];
