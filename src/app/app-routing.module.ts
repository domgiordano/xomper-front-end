import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { SearchComponent } from './pages/search/search.component';
import { MyLeagueComponent } from './pages/my-league/my-league.component';
import { LeagueComponent } from './pages/league/league.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TeamComponent } from './pages/team/team.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'search', component: SearchComponent },
  { path: 'my-league', component: MyLeagueComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard]},
  { path: 'selected-profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'selected-league', component: LeagueComponent, canActivate: [AuthGuard]},
  { path: 'selected-team', component: TeamComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/search', pathMatch: 'full' }, // Redirect empty path to /search
  { path: '**', redirectTo: '/search' }, // Redirect all other paths to /search
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
