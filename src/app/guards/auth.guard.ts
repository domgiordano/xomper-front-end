import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from '../services/league.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private LeagueService: LeagueService, 
    private UserService: UserService,
    private router: Router,
    private ToastService: ToastService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    const url = state.url;

    if (url.includes('my-league')) {
      if (this.LeagueService.leagueSelected()) {
        return true;
      } else {
        this.ToastService.showNegativeToast("User View Selected. Search a league to continue.")
        return false;
      }
    }

    if (url.includes('my-profile')) {
      if (this.UserService.userSelected()) {
        return true;
      } else {
        this.ToastService.showNegativeToast("League View Selected. Search a User to continue.")
        return false;
      }
    }

    // Default allow all other routes
    return true;
  }
}
