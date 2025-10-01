import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './components/loader/loader.component';
import { ToastComponent } from './components/toast/toast.component';
import { SwiperModule } from 'swiper/angular';
import { FooterComponent } from './components/footer/footer.component';
import { SearchComponent } from './pages/search/search.component';
import { MyLeagueComponent } from './pages/my-league/my-league.component';
import { LeagueComponent } from './pages/league/league.component';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { LeagueService } from './services/league.service';
import { UserService } from './services/user.service';
import { ProfileComponent } from './pages/profile/profile.component';
import { TeamComponent } from './pages/team/team.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthService } from './services/auth.service';
import { StandingsService } from './services/standings.service';
import { TeamService } from './services/team.service';
import { MyTeamComponent } from './pages/my-team/my-team.component';
import { SelectedTeamComponent } from './pages/selected-team/selected-team.component';
import { SelectedProfileComponent } from './pages/selected-profile/selected-profile.component';
import { SelectedLeagueComponent } from './pages/selected-league/selected-league.component';
import { PlayerService } from './services/player.service';
import { PlayerModalComponent } from './components/player-modal/player-modal.component';
import { MatchupModalComponent } from './components/matchup-modal/matchup-modal.component';
import { TaxiSquadComponent } from './pages/taxi-squad/taxi-squad.component';
@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    LoaderComponent,
    ToastComponent,
    FooterComponent,
    SearchComponent,
    MyLeagueComponent,
    MyProfileComponent,
    MyTeamComponent,
    LeagueComponent,
    SelectedLeagueComponent,
    ProfileComponent,
    SelectedProfileComponent,
    TeamComponent,
    SelectedTeamComponent,
    HomeComponent,
    PlayerModalComponent,
    MatchupModalComponent,
    TaxiSquadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SwiperModule,
    BrowserAnimationsModule
  ],
  providers: [LeagueService, UserService, AuthService, StandingsService, TeamService, PlayerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
