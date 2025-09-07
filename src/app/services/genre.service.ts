// genre.service.ts
import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class GenresService {
  topGenresShortTerm: { [key: string]: number } = {};
  topGenresMedTerm: { [key: string]: number } = {};
  topGenresLongTerm: { [key: string]: number } = {};

  constructor(
      private AuthService: AuthService,
    ) {}

  getTopGenres(artists: any[], term: string): any {
    let genres = [];
    artists.forEach(artist => {
      genres = [...genres, ...artist.genres];
    });
    let topGenres = {}
    genres.forEach(genre => {
        topGenres[genre] = (topGenres[genre] || 0) + 1;
    });
    if (term === 'short_term'){
        this.setShortTermTopGenres(topGenres);
    }
    else if (term === 'medium_term'){
        this.setMedTermTopGenres(topGenres);
    }
    else{
        this.setLongTermTopGenres(topGenres);
    }
    return topGenres;
  }

  getAllTermsTopGenress(): any {
    return {
      short_term: this.topGenresShortTerm,
      medium_term: this.topGenresMedTerm,
      long_term: this.topGenresLongTerm,
    }
  }
  getShortTermTopGenres(): any {
    return this.topGenresShortTerm;
  }
  getMedTermTopGenres(): any {
    return this.topGenresMedTerm;
  }
  getLongTermTopGenres(): any {
    return this.topGenresLongTerm;
  }
  private setShortTermTopGenres(Genres: any): void {
    this.topGenresShortTerm = Genres;
  }
  private setMedTermTopGenres(Genres: any): void {
    this.topGenresMedTerm = Genres;
  }
  private setLongTermTopGenres(Genres: any): void {
    this.topGenresLongTerm = Genres;
  }

}
