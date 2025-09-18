import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { LeagueService } from 'src/app/services/league.service';

interface LeagueConfig {
  id: string;
  dynasty: boolean;
  divisions: number;
  size: number;
  taxi: boolean;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  title = 'XOMPER';
  loading = false;

  searchTerm = '';
  allLeagues: { key: string; config: LeagueConfig }[] = [];
  filteredLeagues: { key: string; config: LeagueConfig }[] = [];
  selectedLeague: { key: string; config: LeagueConfig } | null = null;
  dropdownVisible = false; // ✅ track visibility

  constructor(
    private LeagueService: LeagueService,
    private router: Router,
    private ToastService: ToastService
  ) {}

  ngOnInit(): void {
    this.allLeagues = Object.entries(this.LeagueService.getLeagueMap())
      .map(([key, config]) => ({ key, config }));
  }

  showDropdown() {
    this.dropdownVisible = true;
    this.filteredLeagues = [...this.allLeagues];
  }

  hideDropdown() {
    this.dropdownVisible = false;
  }

  filterLeagues() {
    const term = this.searchTerm.toLowerCase();
    this.filteredLeagues = this.allLeagues.filter(l =>
      l.key.toLowerCase().includes(term)
    );
    this.dropdownVisible = this.filteredLeagues.length > 0;
  }

  selectLeague(league: { key: string; config: LeagueConfig }) {
    this.selectedLeague = league;
    this.searchTerm = league.key;
    this.hideDropdown();
    this.search();
  }

  search() {
    if (!this.selectedLeague) {
      this.ToastService.showNegativeToast('Please select a league first.');
      return;
    }

    this.loading = true;
    this.LeagueService.reset();

    this.LeagueService.searchLeague(this.selectedLeague.config.id)
      .pipe(take(1))
      .subscribe({
        next: league => {
          this.LeagueService.setMyLeague(league);
          this.ToastService.showPositiveToast('League Found.');
        },
        error: err => {
          console.error('Error Searching League', err);
          this.ToastService.showNegativeToast('Error Finding League.');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.router.navigate([`/home/${this.selectedLeague.key}`], {
            queryParams: { leagueId: this.LeagueService.getMyLeagueId() }
          });
        }
      });
  }
}
