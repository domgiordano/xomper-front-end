import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { forkJoin, take } from 'rxjs';
import { ArtistService } from 'src/app/services/artist.service';
import { GenresService } from 'src/app/services/genre.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-top-genres-page',
  templateUrl: './top-genres.component.html',
  styleUrls: ['./top-genres.component.scss']
})
export class TopGenresComponent implements OnInit {
  selectedTerm: string = 'short_term'; // Default term
  displayedGenres: string[] = [];
  hoveredIndex: number = -1; // To track the hovered genre
  loading: boolean;
  private topArtistsShortTerm: any[];
  private topArtistsMedTerm: any[];
  private topArtistsLongTerm: any[];
  private topGenresShortTerm: any;
  private topGenresMedTerm: any;
  private topGenresLongTerm: any;
  accessToken: string;

  constructor(
      private AuthService: AuthService,
      private ArtistService: ArtistService,
      private GenreService: GenresService,
      private ToastService: ToastService
    ) {}
  ngOnInit() {
    this.accessToken = this.AuthService.getAccessToken();
    this.topArtistsShortTerm = this.ArtistService.getShortTermTopArtists();
    this.topArtistsMedTerm = this.ArtistService.getMedTermTopArtists();
    this.topArtistsLongTerm = this.ArtistService.getLongTermTopArtists();
    this.topGenresShortTerm = this.GenreService.getShortTermTopGenres();
    this.topGenresMedTerm = this.GenreService.getMedTermTopGenres();
    this.topGenresLongTerm = this.GenreService.getLongTermTopGenres();
    if ( this.topArtistsShortTerm.length === 0){
      console.log("Need Top Artists.");
      this.loadTopArtists();
    }
    else if ( Object.entries(this.topGenresShortTerm).length === 0 ){
      console.log("Need top Genres");
      this.loading = true;
      this.loadTopGenres();
      this.loading = false;
    }
    else{
      console.log("We got dem top genres.");
      this.updateDisplayedGenres();
    }

    console.log('shortterm gnere', this.topGenresShortTerm);

  }

  loadTopGenres(){
    this.topGenresShortTerm = this.sortGenres(this.GenreService.getTopGenres(this.topArtistsShortTerm, 'short_term'));
    this.topGenresMedTerm = this.sortGenres(this.GenreService.getTopGenres(this.topArtistsMedTerm, 'medium_term'));
    this.topGenresLongTerm = this.sortGenres(this.GenreService.getTopGenres(this.topArtistsLongTerm, 'long_term'));
    console.log("TOP Genres FOUND ------");
    console.log(this.topGenresShortTerm);
    console.log(this.topGenresMedTerm);
    console.log(this.topGenresLongTerm);

    console.log('Top Genres Loaded.');
    this.updateDisplayedGenres();
  }

  selectTerm(term: string) {
    this.selectedTerm = term;
    this.updateDisplayedGenres();
  }

  updateDisplayedGenres() {
    switch (this.selectedTerm) {
      case 'short_term':
        this.displayedGenres = Object.keys(this.topGenresShortTerm);
        break;
      case 'medium_term':
        this.displayedGenres = Object.keys(this.topGenresMedTerm);
        break;
      case 'long_term':
        this.displayedGenres = Object.keys(this.topGenresLongTerm);
        break;
    }
  }
  private sortGenres(genres){
    let sorted = [];
    for (let genre in genres) {
      sorted.push([genre, genres[genre]]);
    }

    sorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    let genreSorted = {};
    sorted.forEach(function(item){
        genreSorted[item[0]]=item[1]
    });
    return genreSorted;
  }

  loadTopArtists() {
    this.loading = true;
    const getArtistsCalls = forkJoin({
      shortTermResp: this.ArtistService.getTopArtists('short_term'),
      medTermResp: this.ArtistService.getTopArtists('medium_term'),
      longTermResp: this.ArtistService.getTopArtists('long_term'),
    })
    return getArtistsCalls.pipe(take(1)).subscribe({
      next: data => {
        this.updateTopArtists(data.shortTermResp, data.medTermResp, data.longTermResp);
        this.loading = false;
        console.log("TOP ARSTISTS FOUND ------");
        console.log(data);
        this.loadTopGenres();
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
    this.ArtistService.setShortTermTopArtists(this.topArtistsShortTerm);
    this.ArtistService.setMedTermTopArtists(this.topArtistsMedTerm);
    this.ArtistService.setLongTermTopArtists(this.topArtistsLongTerm);
  }
}
