import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private AuthService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.AuthService.isLoggedIn()) {
      return true;
    }
    // redirect to search/home if not signed in
    this.router.navigate(['/home']);
    return false;
  }

}
