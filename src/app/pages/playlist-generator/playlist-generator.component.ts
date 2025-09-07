import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SongService } from 'src/app/services/song.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { forkJoin, take } from 'rxjs';
import { ToastComponent } from 'src/app/components/toast/toast.component';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-playlist-generator-page',
  templateUrl: './playlist-generator.component.html',
  styleUrls: ['./playlist-generator.component.scss']
})
export class PlaylistGeneratorComponent implements OnInit {
  @ViewChild(ToastComponent) toast: ToastComponent;
  loading: boolean;
  tracksLoaded = false;
  tracks: any[];
  accessToken: string;
  releaseStartDate = '1900-01-01';
  releaseEndDate = new Date().toISOString().split('T')[0];
  savedStartDate = '1900-01-01';
  savedEndDate = new Date().toISOString().split('T')[0];
  filters = {
    acousticness: { min: 0.00, max: 1.00 },
    danceability: { min: 0.00, max: 1.00 },
    energy: { min: 0.00, max: 1.00 },
    instrumentalness: { min: 0.00, max: 1.00 },
    liveness: { min: 0.00, max: 1.00 },
    loudness: { min: -60.00, max: 0.00 },
    speechiness: { min: 0.00, max: 1.00 },
    tempo: { min: 0.00, max: 200.00 }
  };

  constructor(
      private http: HttpClient,
      private router: Router,
      private AuthService: AuthService,
      private SongService: SongService,
      private cdr: ChangeDetectorRef,
      private ToastService: ToastService
    ) {}
  ngOnInit() {
    this.accessToken = this.AuthService.getAccessToken();
    this.tracks = this.SongService.getTracks();
    if ( this.tracks.length === 0){
      console.log("Need Tracks.");
      this.loadTracks();
    }
    else{
      console.log("We got dem tracks.");
      this.tracksLoaded = true;
      this.cdr.detectChanges();
    }

  }

  generatePlaylist() {
    // Logic to filter tracks based on input values
    // This would likely involve calling a service that interacts with your music API
    if (this.isButtonInactive()) {
      this.toast.toastType = 'negative';
      this.toast.showToast('Still Loading in all your tracks, chill man.');
    } else {
      console.log('Generating playlist with:', {
        trackDateRange: { releaseStartDate: this.releaseStartDate, releaseEndDate: this.releaseEndDate },
        savedDateRange: { savedStartDate: this.savedStartDate, savedEndDate: this.savedEndDate },
        filters: this.filters
      });
    }

  }

  isButtonInactive(): boolean {
    return !this.tracksLoaded;
  }

  loadTracks() {
    this.loading = true;
    const getTracksCalls = forkJoin({
      oneResp: this.SongService.getAllUserTracks(0),
      twoResp: this.SongService.getAllUserTracks(50),
      threeResp: this.SongService.getAllUserTracks(100),
      fourResp: this.SongService.getAllUserTracks(150),
      fiveResp: this.SongService.getAllUserTracks(200),
      sixResp: this.SongService.getAllUserTracks(250)
    })
    getTracksCalls.pipe(take(1)).subscribe({
      next: data => {
        this.tracks = [...data.oneResp, ...data.twoResp, ...data.threeResp,
          ...data.fourResp, ...data.fiveResp, ...data.sixResp]
        this.SongService.setTracks(this.tracks);
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching user tracks', err);
        this.ToastService.showNegativeToast('Error adding songs to playlist');
        this.loading = false;
      },
      complete: () => {
        console.log('Tracks Loaded.');
        this.tracksLoaded = true;
        this.ToastService.showPositiveToast('Successfully downloaded all your tracks.');
        this.cdr.detectChanges();
      }
    });
  }
}
