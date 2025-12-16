import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const user = localStorage.getItem('user');

  if (user) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};
