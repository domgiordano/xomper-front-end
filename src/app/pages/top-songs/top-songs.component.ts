import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SongService } from 'src/app/services/song.service';
import { AuthService } from 'src/app/services/auth.service';
import { PlayerService } from 'src/app/services/player.service';
import { forkJoin, take } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-top-songs-page',
  templateUrl: './top-songs.component.html',
  styleUrls: ['./top-songs.component.scss']
})
export class TopSongsComponent implements OnInit, OnDestroy {
  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef<HTMLAudioElement>;
  selectedTerm = 'short_term';
  selectedSong: any;
  currentSong = {
    flipped: false
  };
  loading: boolean;
  displayedSongs = [];
  private topTracksShortTerm: any[];
  private topTracksMedTerm: any[];
  private topTracksLongTerm: any[];
  accessToken: string;

  constructor(
    private AuthService: AuthService,
    private SongService: SongService,
    private ToastService: ToastService,
    private PlayerService: PlayerService
  ) {}

  ngOnInit() {
    this.accessToken = this.AuthService.getAccessToken();
    this.topTracksShortTerm = this.SongService.getShortTermTopTracks();
    this.topTracksMedTerm = this.SongService.getMedTermTopTracks();
    this.topTracksLongTerm = this.SongService.getLongTermTopTracks();
    this.displayedSongs = this.topTracksShortTerm;

    if (this.topTracksShortTerm.length === 0) {
      console.log("Need Top Tracks.");
      this.loadTopTracks();
    } else {
      console.log("We got dem top tracks.");
      this.updateDisplayedSongs();
      // Auto-play first track if player ready
      if (this.displayedSongs[0]) this.playSong(this.displayedSongs[0].id, true);
    }
  }

  ngOnDestroy() {
    this.currentSong.flipped = false;
  }

  flipCard(song) {
    this.currentSong.flipped = false;
    this.selectedSong = song;
    if ('flipped' in this.selectedSong) {
      this.selectedSong.flipped = !this.selectedSong.flipped;
    } else {
      this.selectedSong.flipped = true;
    }

    this.getSongStats(this.selectedSong);
    this.currentSong = this.selectedSong;
  }

  flipCardBack(song) {
    this.currentSong.flipped = false;
    this.selectedSong = song;
    this.selectedSong.flipped = false;
  }

  onTermChange() {
    this.SongService.setCurrentTerm(this.selectedTerm);
    this.updateDisplayedSongs();
    console.log(this.displayedSongs);
    console.log('Selected term:', this.selectedTerm);
  }

  updateDisplayedSongs() {
    const songsGrid = document.querySelector('.songs-grid');
    if (songsGrid) {
      songsGrid.classList.add('fade-out'); 
      setTimeout(() => {
        switch (this.selectedTerm) {
          case 'short_term':
            this.displayedSongs = this.topTracksShortTerm;
            break;
          case 'medium_term':
            this.displayedSongs = this.topTracksMedTerm;
            break;
          case 'long_term':
            this.displayedSongs = this.topTracksLongTerm;
            break;
        }
        songsGrid.classList.remove('fade-out');
        // Auto-play first song in the new term
        if (this.displayedSongs[0]) this.playSong(this.displayedSongs[0].id, true);
        this.selectedSong = this.displayedSongs[0];
      }, 500);
    }
  }

  playSong(trackId: string, autoPlay = false) {
    this.PlayerService.playerReady$.pipe(take(1)).subscribe(ready => {
      if (ready) {
        this.PlayerService.playSong(trackId, autoPlay);
      } else {
        console.warn('Player not ready yet.');
      }
    });
  }

  stopSong() {
    this.PlayerService.playerReady$.pipe(take(1)).subscribe(ready => {
      if (ready) {
        this.PlayerService.stopSong();
      } else {
        console.warn('Player not ready yet.');
      }
    });
  }

  getSongStats(song) {
    this.SongService.getSongStats(song.id).pipe(take(1)).subscribe({
      next: stats => this.updateSelectedSong(stats),
      error: err => {
        console.error('Error fetching song stats', err);
        this.ToastService.showNegativeToast('Error adding songs to playlist');
        this.loading = false;
      },
      complete: () => console.log('Song Stats Loaded.')
    });
  }

  private updateSelectedSong(stats): void {
    this.selectedSong.duration = this.convertMillisecondsToMinutesSeconds(stats.duration_ms);
    this.selectedSong.acousticness = stats.acousticness;
    this.selectedSong.danceability = stats.danceability;
    this.selectedSong.energy = stats.energy;
    this.selectedSong.instrumentalness = stats.instrumentalness;
    this.selectedSong.liveness = stats.liveness;
    this.selectedSong.loudness = stats.loudness;
    this.selectedSong.speechiness = stats.speechiness;
    this.selectedSong.tempo = stats.tempo;
    this.selectedSong.valence = stats.valence;
  }

  private convertMillisecondsToMinutesSeconds(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  loadTopTracks() {
    this.loading = true;
    const getTracksCalls = forkJoin({
      shortTermResp: this.SongService.getTopTracks('short_term'),
      medTermResp: this.SongService.getTopTracks('medium_term'),
      longTermResp: this.SongService.getTopTracks('long_term'),
    });

    getTracksCalls.pipe(take(1)).subscribe({
      next: data => {
        this.SongService.setTopTracks(data.shortTermResp.items, data.medTermResp.items, data.longTermResp.items);
        this.topTracksShortTerm = data.shortTermResp.items;
        this.topTracksMedTerm = data.medTermResp.items;
        this.topTracksLongTerm = data.longTermResp.items;
        this.updateDisplayedSongs();
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching user tracks', err);
        this.ToastService.showNegativeToast('Error adding songs to playlist');
        this.loading = false;
      },
      complete: () => console.log('Top Tracks Loaded.')
    });
  }

  formatArtists(artists: any[]): string {
    return artists.map(artist => artist.name).join(', ');
  }

  viewSongDetails(song: any) {
    console.log('Song', song);
  }
}
