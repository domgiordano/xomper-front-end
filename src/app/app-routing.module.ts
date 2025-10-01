import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { SearchComponent } from './pages/search/search.component';
import { MyLeagueComponent } from './pages/my-league/my-league.component';
import { LeagueComponent } from './pages/league/league.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TeamComponent } from './pages/team/team.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { MyTeamComponent } from './pages/my-team/my-team.component';
import { SelectedTeamComponent } from './pages/selected-team/selected-team.component';
import { TaxiSquadComponent } from './pages/taxi-squad/taxi-squad.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // default entry
  { path: 'home/:leagueName', component: HomeComponent },
  { path: 'home', component: SearchComponent }, // fallback if no leagueName
  { path: 'my-league', component: MyLeagueComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] },
  { path: 'my-team', component: MyTeamComponent, canActivate: [AuthGuard] },
  { path: 'selected-profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'selected-league', component: LeagueComponent, canActivate: [AuthGuard] },
  { path: 'selected-team', component: SelectedTeamComponent, canActivate: [AuthGuard] },
  { path: 'taxi-squad', component: TaxiSquadComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/search' }, // Redirect all other paths to /search
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
