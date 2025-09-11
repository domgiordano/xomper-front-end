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
      if (this.LeagueService.myLeagueSelected()) {
        return true;
      } else {
        this.ToastService.showNegativeToast("User View Selected. Search a league to continue.")
        return false;
      }
    }

    if (url.includes('my-profile')) {
      if (this.UserService.myUserSelected()) {
        return true;
      } else {
        this.ToastService.showNegativeToast("League View Selected. Search a User to continue.")
        return false;
      }
    }

    if (url.includes('selected-profile')) {
      if (this.UserService.currentUserSelected()) {
        return true;
      } else {
        this.ToastService.showNegativeToast("Selected Profile View Selected. No other profile viewed yet..")
        return false;
      }
    }

    if (url.includes('selected-league')) {
      if (this.LeagueService.currentLeagueSelected()) {
        return true;
      } else {
        this.ToastService.showNegativeToast("Selected League View Selected. No other league viewed yet.")
        return false;
      }
    }

    // Default allow all other routes
    return true;
  }
}
