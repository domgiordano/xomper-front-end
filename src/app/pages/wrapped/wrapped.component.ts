import { Component, OnInit } from '@angular/core';
import { forkJoin, take } from 'rxjs';
import { ArtistService } from 'src/app/services/artist.service';
import { AuthService } from 'src/app/services/auth.service';
import { GenresService } from 'src/app/services/genre.service';
import { SongService } from 'src/app/services/song.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service'; // Service to handle user info and authentication
import { WrappedService } from 'src/app/services/wrapped.service';

@Component({
  selector: 'app-wrapped',
  templateUrl: './wrapped.component.html',
  styleUrls: ['./wrapped.component.scss'],
})
export class WrappedComponent implements OnInit {
  loading: boolean;
  userEmail: string;
  userId: string;
  refreshToken: string;
  hasOptedIn: boolean = false;
  hasData: boolean = false;
  firstMonth: boolean = false;

  // Objects
  topSongIdsLastMonth: any = {};
  topArtistIdsLastMonth: any = {};
  topGenresLastMonth: any = {};
  topSongIdsTwoMonthsAgo: any = {};
  topArtistIdsTwoMonthsAgo: any = {};
  topGenresTwoMonthsAgo: any = {};

  // The Actual Songs
  topSongShortLastMonth: any[] = [];
  topSongMedLastMonth: any[] = [];
  topSongLongLastMonth: any[] = [];
  topArtistShortLastMonth: any[] = [];
  topArtistMedLastMonth: any[] = [];
  topArtistLongLastMonth: any[] = [];

  constructor(
    private UserService: UserService,
    private WrappedService: WrappedService,
    private AuthService: AuthService,
    private SongService: SongService,
    private ArtistService: ArtistService,
    private GenreService: GenresService,
    private ToastService: ToastService
    ) {}

  ngOnInit() {
    this.userEmail = this.UserService.getEmail()
    this.userId = this.UserService.getUserId();
    this.refreshToken = this.AuthService.getRefreshToken();
    this.loadUserData();
  }

  loadUserData() {
    this.loading = true;
    // Check if the user has opted in
    this.WrappedService.getUserWrappedData(this.userEmail).subscribe({
      next: (userData) => {
        this.hasOptedIn = userData.active;
        console.log('userData', userData);
        if (this.hasOptedIn){
          this.updateSongs(userData);
        }
      },
      error: (err) => {
        this.loading = false;
        this.ToastService.showNegativeToast('Error Fetching your opt-in status.');
        console.error('Error fetching opt-in status:', err);
      },
      complete: () => {
        this.loading = false;
        console.log('User Wrapped Table Data Loaded.');
      }
    });
  }

  private updateSongs(userData: any){
    if(userData.topSongIdsLastMonth.short_term.length == 0){
      this.hasData = false;
      return;
    }

    this.userEmail = userData.email;
    this.userId = userData.id;
    this.refreshToken = userData.refreshToken;
    this.topSongIdsLastMonth = userData.topSongIdsLastMonth;
    this.topArtistIdsLastMonth = userData.topArtistIdsLastMonth;
    this.topGenresLastMonth = userData.topGenresLastMonth;
    this.topSongIdsTwoMonthsAgo = userData.topSongIdsTwoMonthsAgo;
    this.topArtistIdsTwoMonthsAgo = userData.topArtistIdsTwoMonthsAgo;
    this.topGenresTwoMonthsAgo = userData.topGenresTwoMonthsAgo;
    this.hasData = true;

    const wrappedCalls = forkJoin({
      songsShortTermResp: this.SongService.getTracksByIds(this.topSongIdsLastMonth.short_term.join(',')),
      songsMedTermResp: this.SongService.getTracksByIds(this.topSongIdsLastMonth.medium_term.join(',')),
      songsLongTermResp: this.SongService.getTracksByIds(this.topSongIdsLastMonth.long_term.join(',')),
      artistsShortTermResp: this.ArtistService.getArtistsByIds(this.topArtistIdsLastMonth.short_term.join(',')),
      artistsMedTermResp: this.ArtistService.getArtistsByIds(this.topArtistIdsLastMonth.medium_term.join(',')),
      artistsLongTermResp: this.ArtistService.getArtistsByIds(this.topArtistIdsLastMonth.long_term.join(',')),
    });
    this.loading = true;
    wrappedCalls.pipe(take(1)).subscribe({
      next: data => {
        this.topSongShortLastMonth = data.songsShortTermResp.tracks;
        this.topSongMedLastMonth = data.songsMedTermResp.tracks;
        this.topSongLongLastMonth = data.songsLongTermResp.tracks;
        this.topArtistShortLastMonth = data.artistsShortTermResp.artists;
        this.topArtistMedLastMonth = data.artistsMedTermResp.artists;
        this.topArtistLongLastMonth = data.artistsLongTermResp.artists;
        console.log("DATA------------", data);
      },
      error: err => {
        console.error('Error fetching Wrapped Data', err);
        this.ToastService.showNegativeToast('Error adding songs to playlist');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        console.log('Wrapped Data Loaded.');
      }
    });
  }

  signUpForWrapped() {
    // Call the API to sign the user up for monthly wrapped
    this.WrappedService.optInOrOutUserForWrapped(this.userEmail, this.userId, this.refreshToken, true).subscribe({
      next: () => {
        this.hasOptedIn = true;
        this.ToastService.showPositiveToast('Successfully Opted-in for Monthly Wrapped :)');
      },
      error: (err) => {
        console.error('Error opting in:', err);
        this.ToastService.showNegativeToast("Error Opting you into Monthly Wrapped :(");
      }
    });
  }

  getIndicatorClass(rankChange: number): string {
    if (rankChange > 0) {
      return 'green-arrow'; // Class for increased rank
    } else if (rankChange < 0) {
      return 'red-arrow'; // Class for decreased rank
    } else {
      return 'grey-arrow'; // Class for no change
    }
  }

}
