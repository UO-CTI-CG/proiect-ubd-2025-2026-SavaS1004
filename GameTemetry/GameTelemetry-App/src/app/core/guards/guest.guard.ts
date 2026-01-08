import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = () => {
  const userId = sessionStorage.getItem('userId');
  return userId ? inject(Router).createUrlTree(['/home']) : true;
};
