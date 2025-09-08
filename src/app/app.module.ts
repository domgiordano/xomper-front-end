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
import { MyProfileComponent } from './pages/my-profile/my-profile.component';
import { LeagueService } from './services/league.service';
import { UserService } from './services/user.service';
@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    LoaderComponent,
    ToastComponent,
    FooterComponent,
    SearchComponent,
    MyLeagueComponent,
    MyProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SwiperModule,
    BrowserAnimationsModule
  ],
  providers: [LeagueService, UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
