import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { SearchComponent } from './pages/search/search.component';
import { MyLeagueComponent } from './pages/my-league/my-league.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'search', component: SearchComponent },
  { path: '', redirectTo: '/search', pathMatch: 'full' }, // Redirect empty path to /search
  { path: 'my-league', component: MyLeagueComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '/search' }, // Redirect all other paths to /search
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
