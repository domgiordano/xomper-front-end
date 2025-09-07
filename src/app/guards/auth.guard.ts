import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private AuthService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    const isLoggedIn = this.AuthService.isLoggedIn(); // Adjust based on your AuthService implementation

    // If the user is not logged in and trying to access anything except /home
    if (!isLoggedIn && state.url !== '/home') {
      this.router.navigate(['/home']);
      return false; // Prevent navigation to the route
    }

    // If the user is logged in and tries to access /home, redirect them to another route
    if (isLoggedIn && state.url === '/home') {
      this.router.navigate(['/my-profile']); // or another route
      return false; // Prevent access to /home
    }

    return true; // Allow access to the route
  }
}
