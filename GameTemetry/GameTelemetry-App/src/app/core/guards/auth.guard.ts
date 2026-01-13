import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const userId = sessionStorage.getItem('userId');
  return userId ? true : inject(Router).createUrlTree(['/login']);
};
