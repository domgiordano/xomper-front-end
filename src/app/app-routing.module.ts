import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { TopSongsComponent } from './pages/top-songs/top-songs.component';
import { TopArtistsComponent } from './pages/top-artists/top-artists.component';
import { TopGenresComponent } from './pages/top-genres/top-genres.component';
import { PlaylistGeneratorComponent } from './pages/playlist-generator/playlist-generator.component';
import { WrappedComponent } from './pages/wrapped/wrapped.component';
import { AppComponent } from './app.component';
import { CallbackComponent } from './components/callback/callback.component';
import { HomeComponent } from './pages/home/home.component';
import { ArtistProfileComponent } from './pages/artist-profile/artist-profile.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] },
  { path: 'top-songs', component: TopSongsComponent, canActivate: [AuthGuard]},
  { path: 'top-artists', component: TopArtistsComponent, canActivate: [AuthGuard]},
  { path: 'top-genres', component: TopGenresComponent, canActivate: [AuthGuard]},
  //{ path: 'playlist-generator', component: PlaylistGeneratorComponent, canActivate: [AuthGuard]},
  //{ path: 'wrapped', component: WrappedComponent, canActivate: [AuthGuard]},
  { path: 'callback', component: CallbackComponent },
  { path: 'artist', component: ArtistProfileComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect empty path to /home
  { path: '**', redirectTo: '/home' } // Redirect all other paths to /home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
