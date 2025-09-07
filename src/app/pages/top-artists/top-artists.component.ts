import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { forkJoin, take } from 'rxjs';
import { ArtistService } from 'src/app/services/artist.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-top-artists-page',
  templateUrl: './top-artists.component.html',
  styleUrls: ['./top-artists.component.scss']
})
export class TopArtistsComponent implements OnInit {
  selectedTerm = 'short_term';
  displayedArtists: any[] = [];
  loading: boolean;
  private topArtistsShortTerm: any[];
  private topArtistsMedTerm: any[];
  private topArtistsLongTerm: any[];
  accessToken: string;

  constructor(
      private AuthService: AuthService,
      private ArtistService: ArtistService,
      private ToastService: ToastService
    ) {}
  ngOnInit() {
    this.accessToken = this.AuthService.getAccessToken();
    this.topArtistsShortTerm = this.ArtistService.getShortTermTopArtists();
    this.topArtistsMedTerm = this.ArtistService.getMedTermTopArtists();
    this.topArtistsLongTerm = this.ArtistService.getLongTermTopArtists();
    this.displayedArtists = this.topArtistsShortTerm;
    if ( this.topArtistsShortTerm.length === 0){
      console.log("Need Top Artists.");
      this.loadTopArtists();
    }
    else{
      console.log("We got dem top artists.");
      this.updateDisplayedArtists();
    }

  }

  onTermChange() {
    this.updateDisplayedArtists();
    console.log(this.displayedArtists);
    console.log('Selected term:', this.selectedTerm);
  }

  updateDisplayedArtists() {
    const artistsGrid = document.querySelector('.artists-grid');
    if (artistsGrid) {
      artistsGrid.classList.add('fade-out'); // Apply fade-out class
      setTimeout(() => {
        switch (this.selectedTerm) {
          case 'short_term':
            this.displayedArtists = this.topArtistsShortTerm;
            break;
          case 'medium_term':
            this.displayedArtists = this.topArtistsMedTerm;
            break;
          case 'long_term':
            this.displayedArtists = this.topArtistsLongTerm;
            break;
        }
        artistsGrid.classList.remove('fade-out'); // Remove fade-out class after content is updated
      }, 400);
    }
  }

  loadTopArtists() {
    this.loading = true;
    const getArtistsCalls = forkJoin({
      shortTermResp: this.ArtistService.getTopArtists('short_term'),
      medTermResp: this.ArtistService.getTopArtists('medium_term'),
      longTermResp: this.ArtistService.getTopArtists('long_term'),
    })
    getArtistsCalls.pipe(take(1)).subscribe({
      next: data => {
        this.updateTopArtists(data.shortTermResp, data.medTermResp, data.longTermResp);
        this.loading = false;
        console.log("TOP ARSTISTS FOUND ------");
        console.log(data);
      },
      error: err => {
        console.error('Error fetching user artists', err);
        this.ToastService.showNegativeToast('Error adding songs to playlist');
        this.loading = false;
      },
      complete: () => {
        console.log('Top Artists Loaded.');
      }
    });
  }

  private updateTopArtists(short: any, med: any, long: any): void {
    this.topArtistsShortTerm = short.items;
    this.topArtistsMedTerm = med.items;
    this.topArtistsLongTerm = long.items;
    this.updateDisplayedArtists();
    this.ArtistService.setShortTermTopArtists(this.topArtistsShortTerm);
    this.ArtistService.setMedTermTopArtists(this.topArtistsMedTerm);
    this.ArtistService.setLongTermTopArtists(this.topArtistsLongTerm);
  }

  viewArtistDetails(artist: any){
    console.log('Aritst', artist);
  }
}

